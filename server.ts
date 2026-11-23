import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import express, { type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, type GenerateContentResponse } from '@google/genai';
import {
  buildDentPropelSystemInstruction,
  buildGeminiChatSessionInput,
  GEMINI_CHAT_MODELS,
  selectGeminiChatModel,
} from './src/lib/chatLogic';
import {
  buildWebhookEventPayload,
  calculateOfferTotals,
  canTransitionOrderStatus,
  validateClinicCheckoutForm,
  type BillingInterval,
  type ClinicCheckoutInput,
  type CurrencyCode,
  type OrderRecord,
  type PaymentState,
  type PublicBusinessConfig,
  type WebhookEventType,
} from './src/lib/funnelLogic';
import { FALLBACK_PUBLIC_CONFIG } from './src/config/businessConfig';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), '.data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

interface PersistedStore {
  orders: Record<string, OrderRecord>;
  idempotencyIndex: Record<string, string>;
  processedEvents: string[];
}

function readStore(): PersistedStore {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      return { orders: {}, idempotencyIndex: {}, processedEvents: [] };
    }
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as PersistedStore;
    return {
      orders: parsed.orders || {},
      idempotencyIndex: parsed.idempotencyIndex || {},
      processedEvents: Array.isArray(parsed.processedEvents) ? parsed.processedEvents : [],
    };
  } catch {
    return { orders: {}, idempotencyIndex: {}, processedEvents: [] };
  }
}

function writeStore(store: PersistedStore): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${ORDERS_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(tempFile, ORDERS_FILE);
}

function parseOptionalNumber(raw: string | undefined): number | null {
  if (!raw || !raw.trim()) return null;
  const parsed = Number(raw.trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeSafeLink(raw: string | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const trimmed = raw.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

function buildPublicConfig(): PublicBusinessConfig {
  const setupFee = parseOptionalNumber(process.env.OFFER_SETUP_FEE);
  const monthlyFee = parseOptionalNumber(process.env.OFFER_MONTHLY_FEE);
  const taxRatePercent = parseOptionalNumber(process.env.OFFER_TAX_RATE) ?? 0;

  const rawCurrency = (process.env.OFFER_CURRENCY || 'PKR').toUpperCase();
  const currency: CurrencyCode =
    rawCurrency === 'USD' || rawCurrency === 'GBP' || rawCurrency === 'AED' || rawCurrency === 'PKR'
      ? rawCurrency
      : 'PKR';

  const rawInterval = (process.env.OFFER_BILLING_INTERVAL || 'monthly').toLowerCase();
  const billingInterval: BillingInterval =
    rawInterval === 'quarterly' || rawInterval === 'annual' ? rawInterval : 'monthly';

  const isPricingConfigured = setupFee !== null && monthlyFee !== null;
  const paymentProviderName = process.env.PAYMENT_PROVIDER?.trim() || null;
  const paymentProviderConfigured = Boolean(
    paymentProviderName && process.env.PAYMENT_SECRET_KEY?.trim(),
  );

  return {
    ...FALLBACK_PUBLIC_CONFIG,
    pricing: {
      ...FALLBACK_PUBLIC_CONFIG.pricing,
      isPricingConfigured,
      currency,
      billingInterval,
      setupFee,
      monthlyFee,
      taxRatePercent,
    },
    paymentProviderConfigured,
    paymentProviderName,
    contact: {
      email: process.env.CONTACT_EMAIL?.trim() || null,
      whatsapp: process.env.CONTACT_WHATSAPP?.trim() || '03060069993',
    },
    social: {
      facebook: normalizeSafeLink(process.env.SOCIAL_FACEBOOK),
      instagram: normalizeSafeLink(process.env.SOCIAL_INSTAGRAM),
      linkedin: normalizeSafeLink(process.env.SOCIAL_LINKEDIN),
    },
    bookingCalendarUrl: normalizeSafeLink(process.env.BOOKING_CALENDAR_URL),
  };
}

function isPublicWebhookUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null;
    }
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '0.0.0.0' ||
      host === '169.254.169.254' ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      return null;
    }
    if (net.isIP(host)) {
      if (
        host.startsWith('10.') ||
        host.startsWith('192.168.') ||
        host.startsWith('127.') ||
        host.startsWith('169.254.') ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
      ) {
        return null;
      }
    }
    return parsed;
  } catch {
    return null;
  }
}

async function dispatchN8nWebhook(
  eventType: WebhookEventType,
  order: OrderRecord,
): Promise<{ dispatched: boolean; eventId: string }> {
  const eventId = `evt_${crypto.randomUUID()}`;
  const webhookUrlRaw = process.env.N8N_WEBHOOK_URL?.trim();
  if (!webhookUrlRaw) {
    return { dispatched: false, eventId };
  }

  const validUrl = isPublicWebhookUrl(webhookUrlRaw);
  if (!validUrl) {
    return { dispatched: false, eventId };
  }

  const payload = buildWebhookEventPayload(eventType, order, eventId);
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-DentPropel-Event': eventType,
    'X-DentPropel-Event-Id': eventId,
  };

  const secret = process.env.N8N_WEBHOOK_SECRET?.trim();
  if (secret) {
    const sig = crypto.createHmac('sha256', secret).update(body).digest('hex');
    headers['X-DentPropel-Signature'] = sig;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(validUrl.toString(), {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return { dispatched: resp.ok, eventId };
  } catch {
    return { dispatched: false, eventId };
  }
}

function generateOrderId(): string {
  const now = new Date();
  const datePart = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`;
  const randPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `DP-${datePart}-${randPart}`;
}

function sanitizeString(value: unknown, maxLen = 200): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');

  app.use(
    express.json({
      limit: '100kb',
      verify: (req, _res, buf) => {
        (req as Request & { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );

  // Public business config endpoint (never returns secrets)
  app.get('/api/config', (_req: Request, res: Response) => {
    res.json(buildPublicConfig());
  });

  // Create order / clinic application with server-side pricing validation and idempotency
  app.post('/api/orders', async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const idempotencyKey =
      sanitizeString(body.idempotencyKey, 128) ||
      sanitizeString(req.header('X-Idempotency-Key'), 128) ||
      crypto.randomUUID();

    const store = readStore();
    const existingOrderId = store.idempotencyIndex[idempotencyKey];
    if (existingOrderId && store.orders[existingOrderId]) {
      res.status(200).json({
        order: store.orders[existingOrderId],
        idempotentReplay: true,
      });
      return;
    }

    const clinicInput: ClinicCheckoutInput = {
      fullName: sanitizeString(body.fullName, 120),
      clinicName: sanitizeString(body.clinicName, 140),
      email: sanitizeString(body.email, 160),
      phone: sanitizeString(body.phone, 40),
      city: sanitizeString(body.city, 100),
      websiteOrSocial: sanitizeString(body.websiteOrSocial, 200),
      primaryContact: sanitizeString(body.primaryContact, 120),
      termsAccepted: Boolean(body.termsAccepted),
      privacyAccepted: Boolean(body.privacyAccepted),
      billingAgreementAccepted: Boolean(body.billingAgreementAccepted),
      marketingConsent: Boolean(body.marketingConsent),
    };

    const validation = validateClinicCheckoutForm(clinicInput);
    if (!validation.isValid) {
      res.status(400).json({
        error: 'Please review the highlighted clinic details.',
        fieldErrors: validation.errors,
      });
      return;
    }

    const config = buildPublicConfig();
    const selectedDeliverableIds = Array.isArray(body.selectedDeliverableIds)
      ? body.selectedDeliverableIds.filter((id): id is string => typeof id === 'string')
      : config.deliverables.filter((d) => d.includedByDefault).map((d) => d.id);

    const selectedAddonIds = Array.isArray(body.selectedAddonIds)
      ? body.selectedAddonIds.filter((id): id is string => typeof id === 'string')
      : [];

    const pricingSnapshot = calculateOfferTotals(
      config,
      selectedDeliverableIds,
      selectedAddonIds,
    );

    const orderId = generateOrderId();
    const nowIso = new Date().toISOString();
    const previewMode = !pricingSnapshot.isTransactionalReady;

    const order: OrderRecord = {
      id: orderId,
      idempotencyKey,
      clinicDetails: {
        fullName: clinicInput.fullName,
        clinicName: clinicInput.clinicName,
        email: clinicInput.email,
        phone: clinicInput.phone,
        city: clinicInput.city,
        websiteOrSocial: clinicInput.websiteOrSocial || '',
        primaryContact: clinicInput.primaryContact || '',
        marketingConsent: clinicInput.marketingConsent,
      },
      selectedDeliverableIds: selectedDeliverableIds.filter((id) =>
        config.deliverables.some((d) => d.id === id),
      ),
      selectedAddonIds: pricingSnapshot.selectedAddonIds,
      offerName: config.offerName,
      pricingSnapshot,
      paymentStatus: 'pending',
      previewMode,
      paymentProviderName: config.paymentProviderName,
      onboardingStatus: 'not_started',
      utmSource: sanitizeString(body.utmSource, 120) || undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    store.orders[orderId] = order;
    store.idempotencyIndex[idempotencyKey] = orderId;
    writeStore(store);

    await dispatchN8nWebhook('lead.created', order);
    await dispatchN8nWebhook('checkout.started', order);

    res.status(201).json({
      order,
      idempotentReplay: false,
    });
  });

  // Retrieve server-verified order record
  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const orderId = sanitizeString(req.params.id, 64);
    const store = readStore();
    const order = store.orders[orderId];
    if (!order) {
      res.status(404).json({ error: 'Order reference not found.' });
      return;
    }
    res.json({ order });
  });

  // Server-side verification check endpoint
  app.post('/api/orders/:id/verify', (_req: Request, res: Response) => {
    const orderId = sanitizeString(_req.params.id, 64);
    const store = readStore();
    const order = store.orders[orderId];
    if (!order) {
      res.status(404).json({ error: 'Order reference not found.' });
      return;
    }
    // Never auto-promote an unverified payment without gateway verification
    res.json({
      order,
      verified: order.paymentStatus === 'verified',
      message: order.previewMode
        ? 'Order is recorded in Checkout Preview Mode awaiting live gateway integration.'
        : order.paymentStatus === 'verified'
          ? 'Payment verified on server.'
          : 'Awaiting verified confirmation from configured payment gateway.',
    });
  });

  // Update onboarding stage
  app.post('/api/orders/:id/onboarding', async (req: Request, res: Response) => {
    const orderId = sanitizeString(req.params.id, 64);
    const store = readStore();
    const order = store.orders[orderId];
    if (!order) {
      res.status(404).json({ error: 'Order reference not found.' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const nextAction = sanitizeString(body.action, 32);
    const practiceSize = sanitizeString(body.practiceSize, 80);
    const priorityServices = sanitizeString(body.priorityServices, 240);
    const currentTools = sanitizeString(body.currentTools, 240);

    const updatedStatus =
      nextAction === 'complete' ? 'completed' : 'started';

    order.onboardingStatus = updatedStatus;
    order.onboardingNotes = {
      practiceSize: practiceSize || order.onboardingNotes?.practiceSize,
      priorityServices: priorityServices || order.onboardingNotes?.priorityServices,
      currentTools: currentTools || order.onboardingNotes?.currentTools,
    };
    order.updatedAt = new Date().toISOString();

    store.orders[orderId] = order;
    writeStore(store);

    await dispatchN8nWebhook(
      updatedStatus === 'completed' ? 'onboarding.completed' : 'onboarding.started',
      order,
    );

    res.json({ order });
  });

  // Payment gateway server-to-server webhook callback
  app.post('/api/webhooks/payment', async (req: Request, res: Response) => {
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET?.trim();
    if (!webhookSecret) {
      res.status(503).json({
        error: 'Payment webhook secret is not configured on this server.',
      });
      return;
    }

    const providedSig = req.header('X-Payment-Signature') || '';
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody || Buffer.from('');
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const providedBuf = Buffer.from(providedSig, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (
      providedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
      res.status(401).json({ error: 'Invalid webhook signature.' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const eventId = sanitizeString(body.eventId, 128);
    const orderId = sanitizeString(body.orderId, 64);
    const targetStatus = sanitizeString(body.status, 32) as PaymentState;

    const store = readStore();
    if (eventId && store.processedEvents.includes(eventId)) {
      res.status(200).json({ received: true, duplicate: true });
      return;
    }

    const order = store.orders[orderId];
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (canTransitionOrderStatus(order.paymentStatus, targetStatus)) {
      order.paymentStatus = targetStatus;
      order.previewMode = false;
      order.updatedAt = new Date().toISOString();
      store.orders[orderId] = order;
      if (eventId) {
        store.processedEvents.push(eventId);
      }
      writeStore(store);

      if (targetStatus === 'verified') {
        await dispatchN8nWebhook('order.payment_verified', order);
      }
    }

    res.json({ received: true, orderId, paymentStatus: order.paymentStatus });
  });

  // Server-side multi-turn Gemini chatbot endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      res.status(503).json({
        error:
          'Gemini assistant requires GEMINI_API_KEY in Settings > Secrets. You can reach us immediately on WhatsApp at 0306-0069993.',
      });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const route = sanitizeString(body.route, 64) || '/';
    const model = selectGeminiChatModel(body.speedMode);
    const { history, latestMessage } = buildGeminiChatSessionInput(body.messages);

    if (!latestMessage) {
      res.status(400).json({
        error: 'Please enter a valid message to continue the conversation.',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = buildDentPropelSystemInstruction(route);
      const runChatWithModel = async (targetModel: string) => {
        const chat = ai.chats.create({
          model: targetModel,
          history,
          config: { systemInstruction },
        });
        return chat.sendMessage({ message: latestMessage });
      };

      let activeModel = model;
      let response: GenerateContentResponse;
      try {
        response = await runChatWithModel(activeModel);
      } catch (firstErr) {
        const firstMsg = firstErr instanceof Error ? firstErr.message : '';
        const isTransientBusy = /503|UNAVAILABLE|high demand|overloaded/i.test(firstMsg);
        if (!isTransientBusy) {
          throw firstErr;
        }
        await new Promise((r) => setTimeout(r, 600));
        activeModel =
          activeModel === GEMINI_CHAT_MODELS.fast
            ? GEMINI_CHAT_MODELS.standard
            : GEMINI_CHAT_MODELS.fast;
        response = await runChatWithModel(activeModel);
      }

      const replyText = (response.text || '').trim();
      if (!replyText) {
        res.status(502).json({
          error: 'No response text was returned by the assistant. Please try again.',
        });
        return;
      }

      res.json({
        reply: replyText,
        modelUsed: activeModel,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unexpected Gemini API error';
      if (/PERMISSION_DENIED|API_KEY_INVALID/i.test(msg)) {
        res.status(403).json({
          error:
            'Gemini API key could not be verified. Please check GEMINI_API_KEY in Settings > Secrets.',
        });
        return;
      }
      if (/RESOURCE_EXHAUSTED|429/i.test(msg)) {
        res.status(429).json({
          error:
            'Assistant rate limit reached momentarily. Please try again shortly or message us on WhatsApp (0306-0069993).',
        });
        return;
      }
      if (/503|UNAVAILABLE|high demand|overloaded/i.test(msg)) {
        res.status(503).json({
          error:
            'The AI service is experiencing high temporary demand. Please try again in a moment or message us directly on WhatsApp (0306-0069993).',
        });
        return;
      }
      res.status(502).json({
        error:
          'Unable to reach the assistant right now. Please try again or reach us on WhatsApp (0306-0069993).',
      });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dent Propel server listening on http://localhost:${PORT}`);
  });
}

startServer();
