import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWebhookEventPayload,
  buildWhatsAppRedirectUrl,
  calculateOfferTotals,
  canTransitionOrderStatus,
  deriveThankYouDisplayState,
  validateClinicCheckoutForm,
  validateSafeExternalUrl,
  type OrderRecord,
  type PublicBusinessConfig,
} from './funnelLogic';
import { FALLBACK_PUBLIC_CONFIG } from '../config/businessConfig';

test('calculateOfferTotals keeps preview mode honest when pricing is not configured', () => {
  const result = calculateOfferTotals(
    FALLBACK_PUBLIC_CONFIG,
    ['social-strategy', 'ai-automation'],
    [],
  );
  assert.equal(result.isTransactionalReady, false);
  assert.equal(result.setupFee, null);
  assert.equal(result.monthlyFee, null);
  assert.equal(result.totalDueNow, null);
  assert.equal(result.selectedDeliverableCount, 2);
});

test('calculateOfferTotals computes setup + monthly + tax accurately when configured', () => {
  const configured: PublicBusinessConfig = {
    ...FALLBACK_PUBLIC_CONFIG,
    paymentProviderConfigured: true,
    paymentProviderName: 'PayFast',
    pricing: {
      ...FALLBACK_PUBLIC_CONFIG.pricing,
      isPricingConfigured: true,
      currency: 'PKR',
      setupFee: 50000,
      monthlyFee: 120000,
      taxRatePercent: 16,
    },
    addons: [
      {
        id: 'multi-branch-routing',
        label: 'Multi-Branch',
        description: 'Routing',
        setupFeeDelta: 10000,
        monthlyFeeDelta: 20000,
      },
    ],
  };

  const result = calculateOfferTotals(
    configured,
    ['social-strategy', 'paid-campaigns', 'ai-automation'],
    ['multi-branch-routing'],
  );

  assert.equal(result.isTransactionalReady, true);
  assert.equal(result.subtotalDueNow, 200000);
  assert.equal(result.taxAmountDueNow, 32000);
  assert.equal(result.totalDueNow, 232000);
  assert.equal(result.recurringTotalPerCycle, 162400);
});

test('validateClinicCheckoutForm enforces required clinic fields and rejects unsafe URLs', () => {
  const invalid = validateClinicCheckoutForm({
    fullName: '',
    clinicName: 'A',
    email: 'invalid-email',
    phone: '123',
    city: '',
    websiteOrSocial: 'javascript:alert(1)',
    termsAccepted: false,
    privacyAccepted: false,
    billingAgreementAccepted: false,
    marketingConsent: false,
  });

  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.clinicName);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.city);
  assert.ok(invalid.errors.websiteOrSocial);
  assert.ok(invalid.errors.termsAccepted);
  assert.ok(invalid.errors.privacyAccepted);
  assert.ok(invalid.errors.billingAgreementAccepted);

  assert.equal(validateSafeExternalUrl('https://apexdental.pk'), true);
  assert.equal(validateSafeExternalUrl('@apexdentalpk'), true);
  assert.equal(validateSafeExternalUrl('javascript:void(0)'), false);

  const valid = validateClinicCheckoutForm({
    fullName: 'Dr. Ayesha Khan',
    clinicName: 'Apex Dental Studio',
    email: 'ayesha@apexdental.pk',
    phone: '+92 300 1234567',
    city: 'Lahore',
    websiteOrSocial: 'https://apexdental.pk',
    primaryContact: 'Practice Manager',
    termsAccepted: true,
    privacyAccepted: true,
    billingAgreementAccepted: true,
    marketingConsent: true,
  });

  assert.equal(valid.isValid, true);
  assert.deepEqual(valid.errors, {});
});

test('order state transitions and thank-you display derivation handle verified, pending, and failed states', () => {
  assert.equal(canTransitionOrderStatus('pending', 'verified'), true);
  assert.equal(canTransitionOrderStatus('verified', 'failed'), false);

  const baseOrder: OrderRecord = {
    id: 'DP-20261123-1001',
    idempotencyKey: 'idem-1',
    clinicDetails: {
      fullName: 'Dr. Bilal Ahmed',
      clinicName: 'Crescent Dental Care',
      email: 'bilal@crescentdental.pk',
      phone: '+923001112233',
      city: 'Karachi',
      websiteOrSocial: '',
      primaryContact: '',
      marketingConsent: false,
    },
    selectedDeliverableIds: ['social-strategy'],
    selectedAddonIds: [],
    offerName: 'Dent Propel Growth System',
    pricingSnapshot: calculateOfferTotals(FALLBACK_PUBLIC_CONFIG, ['social-strategy'], []),
    paymentStatus: 'pending',
    previewMode: true,
    paymentProviderName: null,
    onboardingStatus: 'not_started',
    createdAt: '2026-11-23T08:00:00.000Z',
    updatedAt: '2026-11-23T08:00:00.000Z',
  };

  const pendingState = deriveThankYouDisplayState(baseOrder);
  assert.equal(pendingState.showSuccessConfirmation, false);
  assert.equal(pendingState.canStartOnboarding, true);

  const verifiedState = deriveThankYouDisplayState({
    ...baseOrder,
    previewMode: false,
    paymentStatus: 'verified',
  });
  assert.equal(verifiedState.showSuccessConfirmation, true);
  assert.equal(verifiedState.headline, 'Welcome to Dent Propel.');

  const failedState = deriveThankYouDisplayState({
    ...baseOrder,
    previewMode: false,
    paymentStatus: 'failed',
  });
  assert.equal(failedState.canReturnToCheckout, true);
  assert.equal(failedState.showSuccessConfirmation, false);

  const webhook = buildWebhookEventPayload('checkout.started', baseOrder, 'evt-123');
  assert.equal(webhook.eventType, 'checkout.started');
  assert.equal(webhook.data.clinicName, 'Crescent Dental Care');
});

test('buildWhatsAppRedirectUrl normalizes Pakistani local and international numbers cleanly', () => {
  assert.equal(
    buildWhatsAppRedirectUrl('03060069993'),
    'https://wa.me/923060069993',
  );
  assert.equal(
    buildWhatsAppRedirectUrl('+92 306-0069993', 'Hello Dent Propel'),
    'https://wa.me/923060069993?text=Hello%20Dent%20Propel',
  );
});

