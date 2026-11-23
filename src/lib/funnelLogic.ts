export type CurrencyCode = 'PKR' | 'USD' | 'GBP' | 'AED';
export type BillingInterval = 'monthly' | 'quarterly' | 'annual';

export type PaymentState =
  | 'ready'
  | 'processing'
  | 'pending'
  | 'verified'
  | 'failed'
  | 'canceled'
  | 'verification_error';

export type OnboardingStatus = 'not_started' | 'started' | 'completed';

export type WebhookEventType =
  | 'lead.created'
  | 'checkout.started'
  | 'order.payment_verified'
  | 'onboarding.started'
  | 'onboarding.completed';

export interface OfferDeliverable {
  id: string;
  group: 'Growth & Marketing' | 'Lead & Automation' | 'Visibility & Reporting';
  label: string;
  description: string;
  includedByDefault: boolean;
  configurable: boolean;
}

export interface OfferAddon {
  id: string;
  label: string;
  description: string;
  setupFeeDelta: number | null;
  monthlyFeeDelta: number | null;
}

export interface PricingConfiguration {
  isPricingConfigured: boolean;
  currency: CurrencyCode;
  billingInterval: BillingInterval;
  setupFee: number | null;
  monthlyFee: number | null;
  taxRatePercent: number;
  paidAdSpendNote: string;
  thirdPartySoftwareNote: string;
  cancellationTerms: string;
}

export interface PublicBusinessConfig {
  brandName: string;
  tagline: string;
  market: string;
  offerName: string;
  pricing: PricingConfiguration;
  paymentProviderConfigured: boolean;
  paymentProviderName: string | null;
  deliverables: OfferDeliverable[];
  addons: OfferAddon[];
  contact: {
    email: string | null;
    whatsapp: string | null;
  };
  social: {
    facebook: string | null;
    instagram: string | null;
    linkedin: string | null;
  };
  bookingCalendarUrl: string | null;
}

export interface OfferCalculationResult {
  isTransactionalReady: boolean;
  currency: CurrencyCode;
  billingInterval: BillingInterval;
  setupFee: number | null;
  monthlyFee: number | null;
  addonsSetupTotal: number | null;
  addonsMonthlyTotal: number | null;
  subtotalDueNow: number | null;
  taxAmountDueNow: number | null;
  totalDueNow: number | null;
  recurringTotalPerCycle: number | null;
  taxRatePercent: number;
  selectedDeliverableCount: number;
  selectedAddonIds: string[];
}

export interface ClinicCheckoutInput {
  fullName: string;
  clinicName: string;
  email: string;
  phone: string;
  city: string;
  websiteOrSocial?: string;
  primaryContact?: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  billingAgreementAccepted: boolean;
  marketingConsent: boolean;
}

export interface CheckoutValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof ClinicCheckoutInput, string>>;
}

export interface OrderRecord {
  id: string;
  idempotencyKey: string;
  clinicDetails: {
    fullName: string;
    clinicName: string;
    email: string;
    phone: string;
    city: string;
    websiteOrSocial: string;
    primaryContact: string;
    marketingConsent: boolean;
  };
  selectedDeliverableIds: string[];
  selectedAddonIds: string[];
  offerName: string;
  pricingSnapshot: OfferCalculationResult;
  paymentStatus: PaymentState;
  previewMode: boolean;
  paymentProviderName: string | null;
  onboardingStatus: OnboardingStatus;
  onboardingNotes?: {
    practiceSize?: string;
    priorityServices?: string;
    currentTools?: string;
  };
  utmSource?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThankYouDisplayState {
  status: PaymentState;
  badgeText: string;
  headline: string;
  subheadline: string;
  description: string;
  showSuccessConfirmation: boolean;
  canStartOnboarding: boolean;
  canRetryVerification: boolean;
  canReturnToCheckout: boolean;
}

export function calculateOfferTotals(
  config: PublicBusinessConfig,
  selectedDeliverableIds: string[],
  selectedAddonIds: string[],
): OfferCalculationResult {
  const validDeliverableIds = new Set(config.deliverables.map((d) => d.id));
  const selectedDeliverableCount = selectedDeliverableIds.filter((id) =>
    validDeliverableIds.has(id),
  ).length;

  const uniqueAddonIds = Array.from(new Set(selectedAddonIds)).filter((id) =>
    config.addons.some((a) => a.id === id),
  );

  const { pricing } = config;
  const isTransactionalReady =
    pricing.isPricingConfigured &&
    pricing.setupFee !== null &&
    pricing.monthlyFee !== null &&
    config.paymentProviderConfigured;

  if (!pricing.isPricingConfigured || pricing.setupFee === null || pricing.monthlyFee === null) {
    return {
      isTransactionalReady: false,
      currency: pricing.currency,
      billingInterval: pricing.billingInterval,
      setupFee: null,
      monthlyFee: null,
      addonsSetupTotal: null,
      addonsMonthlyTotal: null,
      subtotalDueNow: null,
      taxAmountDueNow: null,
      totalDueNow: null,
      recurringTotalPerCycle: null,
      taxRatePercent: pricing.taxRatePercent,
      selectedDeliverableCount,
      selectedAddonIds: uniqueAddonIds,
    };
  }

  let addonsSetupTotal = 0;
  let addonsMonthlyTotal = 0;

  for (const addonId of uniqueAddonIds) {
    const addon = config.addons.find((a) => a.id === addonId);
    if (!addon) continue;
    addonsSetupTotal += addon.setupFeeDelta ?? 0;
    addonsMonthlyTotal += addon.monthlyFeeDelta ?? 0;
  }

  const baseSetup = pricing.setupFee;
  const baseMonthly = pricing.monthlyFee;
  const subtotalDueNow = roundCurrency(baseSetup + addonsSetupTotal + baseMonthly + addonsMonthlyTotal);
  const taxRate = Math.max(0, pricing.taxRatePercent) / 100;
  const taxAmountDueNow = roundCurrency(subtotalDueNow * taxRate);
  const totalDueNow = roundCurrency(subtotalDueNow + taxAmountDueNow);
  const recurringSubtotal = roundCurrency(baseMonthly + addonsMonthlyTotal);
  const recurringTotalPerCycle = roundCurrency(recurringSubtotal * (1 + taxRate));

  return {
    isTransactionalReady,
    currency: pricing.currency,
    billingInterval: pricing.billingInterval,
    setupFee: baseSetup,
    monthlyFee: baseMonthly,
    addonsSetupTotal,
    addonsMonthlyTotal,
    subtotalDueNow,
    taxAmountDueNow,
    totalDueNow,
    recurringTotalPerCycle,
    taxRatePercent: pricing.taxRatePercent,
    selectedDeliverableCount,
    selectedAddonIds: uniqueAddonIds,
  };
}

function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function formatMoney(amount: number | null, currency: CurrencyCode): string {
  if (amount === null || Number.isNaN(amount)) {
    return 'Scoped per clinic';
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'PKR' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-US')}`;
  }
}

export function validateSafeExternalUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return true;
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return false;
  }
  // Allow clean @handles or domain strings without spaces
  if (/^@[a-zA-Z0-9._-]{2,50}$/.test(trimmed)) {
    return true;
  }
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      parsed.hostname.includes('.')
    );
  } catch {
    return false;
  }
}

export function validateClinicCheckoutForm(
  input: ClinicCheckoutInput,
): CheckoutValidationResult {
  const errors: Partial<Record<keyof ClinicCheckoutInput, string>> = {};

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Enter the doctor or clinic owner full name.';
  }

  if (!input.clinicName || input.clinicName.trim().length < 2) {
    errors.clinicName = 'Enter your dental clinic or practice name.';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!input.email || !emailPattern.test(input.email.trim())) {
    errors.email = 'Enter a valid business email address.';
  }

  const cleanedPhone = (input.phone || '').replace(/[\s()-]/g, '');
  if (!/^\+?[0-9]{9,15}$/.test(cleanedPhone)) {
    errors.phone = 'Enter a valid phone or WhatsApp number (9–15 digits).';
  }

  if (!input.city || input.city.trim().length < 2) {
    errors.city = 'Enter the city where your clinic operates.';
  }

  if (input.websiteOrSocial && !validateSafeExternalUrl(input.websiteOrSocial)) {
    errors.websiteOrSocial = 'Enter a valid website URL (https://...) or @handle.';
  }

  if (!input.termsAccepted) {
    errors.termsAccepted = 'Please accept the Terms of Service to continue.';
  }

  if (!input.privacyAccepted) {
    errors.privacyAccepted = 'Please review and accept the Privacy Policy.';
  }

  if (!input.billingAgreementAccepted) {
    errors.billingAgreementAccepted =
      'Please acknowledge the service scope and billing terms.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

const VALID_TRANSITIONS: Record<PaymentState, PaymentState[]> = {
  ready: ['processing', 'pending', 'canceled', 'failed'],
  processing: ['pending', 'verified', 'failed', 'canceled', 'verification_error'],
  pending: ['verified', 'failed', 'canceled', 'verification_error'],
  verification_error: ['pending', 'verified', 'failed', 'canceled'],
  failed: ['ready', 'processing', 'pending'],
  canceled: ['ready', 'processing', 'pending'],
  verified: ['verified'],
};

export function canTransitionOrderStatus(from: PaymentState, to: PaymentState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function deriveThankYouDisplayState(order: OrderRecord | null): ThankYouDisplayState {
  if (!order) {
    return {
      status: 'verification_error',
      badgeText: 'Order Record Unavailable',
      headline: 'Order Reference Not Found.',
      subheadline: 'We could not locate a verified order matching that reference.',
      description:
        'Please return to checkout to review your clinic details or reach out to our team if you already initiated a submission.',
      showSuccessConfirmation: false,
      canStartOnboarding: false,
      canRetryVerification: false,
      canReturnToCheckout: true,
    };
  }

  switch (order.paymentStatus) {
    case 'verified':
      return {
        status: 'verified',
        badgeText: 'Verified Order Confirmed',
        headline: 'Welcome to Dent Propel.',
        subheadline: 'Your Dental Practice Growth Journey Begins Here.',
        description:
          'Your order has been confirmed. The next step is understanding your clinic’s priorities and preparing the onboarding process.',
        showSuccessConfirmation: true,
        canStartOnboarding: true,
        canRetryVerification: false,
        canReturnToCheckout: false,
      };
    case 'pending':
      return {
        status: 'pending',
        badgeText: order.previewMode ? 'Preview Request Recorded' : 'Pending Payment Verification',
        headline: order.previewMode
          ? 'Practice Application Recorded.'
          : 'Your payment is being verified.',
        subheadline: order.previewMode
          ? 'Checkout Preview Mode — No Charge Processed.'
          : 'Awaiting Confirmation From Your Payment Provider.',
        description: order.previewMode
          ? 'Live payment processing is not yet enabled on this environment. Your clinic scope and contact details have been saved for scoping and onboarding review.'
          : 'Your payment is being verified by the gateway. You can refresh the verification check below or wait for your confirmation email.',
        showSuccessConfirmation: false,
        canStartOnboarding: order.previewMode,
        canRetryVerification: true,
        canReturnToCheckout: false,
      };
    case 'failed':
      return {
        status: 'failed',
        badgeText: 'Payment Unsuccessful',
        headline: 'Payment Could Not Be Completed.',
        subheadline: 'No Verified Charge Was Recorded.',
        description:
          'Your payment attempt was declined or could not be processed. You can safely return to checkout to retry with another method.',
        showSuccessConfirmation: false,
        canStartOnboarding: false,
        canRetryVerification: false,
        canReturnToCheckout: true,
      };
    case 'canceled':
      return {
        status: 'canceled',
        badgeText: 'Checkout Canceled',
        headline: 'Checkout Session Canceled.',
        subheadline: 'Your Clinic Details Remain Saved Locally.',
        description:
          'You canceled the payment step before completion. Return to checkout whenever your clinic is ready to proceed.',
        showSuccessConfirmation: false,
        canStartOnboarding: false,
        canRetryVerification: false,
        canReturnToCheckout: true,
      };
    case 'verification_error':
    default:
      return {
        status: 'verification_error',
        badgeText: 'Verification Check Interrupted',
        headline: 'Unable to Verify Payment Status.',
        subheadline: 'Please Retry Verification Before Proceeding.',
        description:
          'We encountered a temporary issue confirming the transaction with the server. Use the retry action below to re-check your verified status.',
        showSuccessConfirmation: false,
        canStartOnboarding: false,
        canRetryVerification: true,
        canReturnToCheckout: true,
      };
  }
}

export function buildWebhookEventPayload(
  eventType: WebhookEventType,
  order: OrderRecord,
  eventId: string,
) {
  return {
    eventId,
    eventType,
    timestamp: new Date().toISOString(),
    source: 'dent-propel-funnel',
    data: {
      orderId: order.id,
      clinicName: order.clinicDetails.clinicName,
      businessContact: order.clinicDetails.primaryContact || order.clinicDetails.fullName,
      fullName: order.clinicDetails.fullName,
      email: order.clinicDetails.email,
      phone: order.clinicDetails.phone,
      city: order.clinicDetails.city,
      websiteOrSocial: order.clinicDetails.websiteOrSocial || null,
      selectedOffer: order.offerName,
      selectedDeliverableIds: order.selectedDeliverableIds,
      selectedAddonIds: order.selectedAddonIds,
      checkoutStatus: order.previewMode ? 'preview_submitted' : 'checkout_submitted',
      verifiedPaymentStatus: order.paymentStatus,
      onboardingStatus: order.onboardingStatus,
      currency: order.pricingSnapshot.currency,
      totalDueNow: order.pricingSnapshot.totalDueNow,
      utmSource: order.utmSource || null,
      createdAt: order.createdAt,
    },
  };
}

export const DEFAULT_WHATSAPP_NUMBER = '03060069993';

/**
 * Normalizes a local (e.g. 03060069993) or international (+92 306 0069993) WhatsApp
 * number into digits suitable for wa.me links and builds a safe redirect URL.
 */
export function buildWhatsAppRedirectUrl(
  rawPhone: string | null | undefined,
  message?: string,
): string {
  const digitsOnly = (rawPhone || DEFAULT_WHATSAPP_NUMBER).replace(/\D/g, '');
  const normalized =
    digitsOnly.startsWith('0') && digitsOnly.length === 11
      ? `92${digitsOnly.slice(1)}`
      : digitsOnly || '923060069993';

  const base = `https://wa.me/${normalized}`;
  if (message && message.trim()) {
    return `${base}?text=${encodeURIComponent(message.trim())}`;
  }
  return base;
}

