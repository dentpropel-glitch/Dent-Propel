import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Loader2,
  Lock,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { useFunnel } from '../context/FunnelContext';
import {
  buildWhatsAppRedirectUrl,
  calculateOfferTotals,
  formatMoney,
  validateClinicCheckoutForm,
  type ClinicCheckoutInput,
  type PaymentState,
} from '../lib/funnelLogic';

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `dp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function CheckoutPage() {
  const {
    config,
    selectedDeliverableIds,
    selectedAddonIds,
    toggleAddon,
    navigate,
    setLastOrderId,
  } = useFunnel();

  const [form, setForm] = useState<ClinicCheckoutInput>({
    fullName: '',
    clinicName: '',
    email: '',
    phone: '',
    city: '',
    websiteOrSocial: '',
    primaryContact: '',
    termsAccepted: false,
    privacyAccepted: false,
    billingAgreementAccepted: false,
    marketingConsent: false,
  });

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ClinicCheckoutInput, string>>
  >({});
  const [paymentState, setPaymentState] = useState<PaymentState>('ready');
  const [serverError, setServerError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(createIdempotencyKey);

  const totals = useMemo(
    () => calculateOfferTotals(config, selectedDeliverableIds, selectedAddonIds),
    [config, selectedDeliverableIds, selectedAddonIds],
  );

  const selectedDeliverables = config.deliverables.filter((d) =>
    selectedDeliverableIds.includes(d.id),
  );

  const whatsappUrl = buildWhatsAppRedirectUrl(
    config.contact.whatsapp,
    `Hello Dent Propel, I would like to claim the Dent Propel Growth System${
      form.clinicName.trim() ? ` for ${form.clinicName.trim()}` : ''
    } (${selectedDeliverables.length} selected modules).`,
  );

  const handleFieldChange = <K extends keyof ClinicCheckoutInput>(
    field: K,
    value: ClinicCheckoutInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateClinicCheckoutForm(form);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setPaymentState('processing');
    try {
      const utmParams = new URLSearchParams(window.location.search);
      const utmSource = utmParams.get('utm_source') || undefined;

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          ...form,
          idempotencyKey,
          selectedDeliverableIds,
          selectedAddonIds,
          utmSource,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        setServerError(data.error || 'Could not process your checkout submission.');
        setPaymentState('failed');
        return;
      }

      const orderId = data.order?.id as string | undefined;
      if (!orderId) {
        setServerError('Order reference missing from server response.');
        setPaymentState('verification_error');
        return;
      }

      setLastOrderId(orderId);
      setIdempotencyKey(createIdempotencyKey());
      setPaymentState('pending');
      navigate(`/thank-you?orderId=${encodeURIComponent(orderId)}`);
    } catch {
      setServerError(
        'Network interruption while connecting to the checkout server. Please try again.',
      );
      setPaymentState('verification_error');
    }
  };

  return (
    <main className="py-10 sm:py-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#46596A] dark:text-[#B8C8D8] hover:text-[#087D94] dark:hover:text-[#22D3D5] mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Growth System Overview</span>
        </button>

        <div className="max-w-3xl mb-10">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] leading-[1.15] font-bold tracking-tight text-[#102338] dark:text-[#F5FAFF] text-balance">
            Let’s Build a Smarter Growth Process for Your Dental Practice.
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[#46596A] dark:text-[#B8C8D8]">
            Complete your clinic details, review your selected system, and continue to secure
            payment.
          </p>
        </div>

        {/* Preview Notice when payment gateway / live pricing isn't configured */}
        {!totals.isTransactionalReady && (
          <div className="mb-8 rounded-2xl border border-[#087D94]/40 dark:border-[#22D3D5]/40 bg-[#EAF8FA] dark:bg-[#152337] p-5 flex items-start gap-3.5">
            <Info className="w-5 h-5 text-[#087D94] dark:text-[#22D3D5] mt-0.5 shrink-0" aria-hidden="true" />
            <div className="text-sm leading-relaxed text-[#102338] dark:text-[#F5FAFF]">
              <strong className="font-semibold">Checkout Preview Mode:</strong> No live payment
              gateway credentials are configured on this server. No payment card data is collected
              and no financial charge will occur. Submitting this form records your clinic scoping
              application securely on the server and demonstrates the onboarding handoff.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Clinic Details Form & Payment Section */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="lg:col-span-7 space-y-8"
          >
            {/* Clinic Details Card */}
            <section className="rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="pb-4 border-b border-[#DCE7EE] dark:border-[#304258]">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#102338] dark:text-[#F5FAFF]">
                  Clinic & Practice Details
                </h2>
                <p className="mt-1 text-sm text-[#46596A] dark:text-[#B8C8D8]">
                  Enter business contact information only. Do not submit patient medical records.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="dp-fullName"
                    className="block text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] mb-1.5"
                  >
                    Doctor or Clinic Owner Full Name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="dp-fullName"
                    name="fullName"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
                    placeholder="e.g., Dr. Ayesha Khan"
                    aria-invalid={Boolean(fieldErrors.fullName)}
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] text-[#102338] dark:text-[#F5FAFF] placeholder-[#46596A]/60 dark:placeholder-[#B8C8D8]/50 focus:outline-none focus:ring-2 focus:ring-[#087D94] dark:focus:ring-[#22D3D5]"
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="dp-clinicName"
                    className="block text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] mb-1.5"
                  >
                    Dental Clinic Name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="dp-clinicName"
                    name="clinicName"
                    type="text"
                    required
                    value={form.clinicName}
                    onChange={(e) => handleFieldChange('clinicName', e.target.value)}
                    placeholder="e.g., Apex Dental Studio"
                    aria-invalid={Boolean(fieldErrors.clinicName)}
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] text-[#102338] dark:text-[#F5FAFF] placeholder-[#46596A]/60 dark:placeholder-[#B8C8D8]/50 focus:outline-none focus:ring-2 focus:ring-[#087D94] dark:focus:ring-[#22D3D5]"
                  />
                  {fieldErrors.clinicName && (
                    <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                      {fieldErrors.clinicName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="dp-city"
                    className="block text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] mb-1.5"
                  >
                    Clinic City <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="dp-city"
                    name="city"
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    placeholder="e.g., Lahore"
                    aria-invalid={Boolean(fieldErrors.city)}
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] text-[#102338] dark:text-[#F5FAFF] placeholder-[#46596A]/60 dark:placeholder-[#B8C8D8]/50 focus:outline-none focus:ring-2 focus:ring-[#087D94] dark:focus:ring-[#22D3D5]"
                  />
                  {fieldErrors.city && (
                    <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                      {fieldErrors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="dp-email"
                    className="block text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] mb-1.5"
                  >
                    Business Email <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="dp-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="doctor@clinicname.pk"
                    aria-invalid={Boolean(fieldErrors.email)}
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] text-[#102338] dark:text-[#F5FAFF] placeholder-[#46596A]/60 dark:placeholder-[#B8C8D8]/50 focus:outline-none focus:ring-2 focus:ring-[#087D94] dark:focus:ring-[#22D3D5]"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="dp-phone"
                    className="block text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] mb-1.5"
                  >
                    Phone / WhatsApp Number <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="dp-phone"
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="+92 300 0000000"
                    aria-invalid={Boolean(fieldErrors.phone)}
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] text-[#102338] dark:text-[#F5FAFF] placeholder-[#46596A]/60 dark:placeholder-[#B8C8D8]/50 focus:outline-none focus:ring-2 focus:ring-[#087D94] dark:focus:ring-[#22D3D5]"
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="dp-website"
                    className="block text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] mb-1.5"
                  >
                    Clinic Website or Instagram (Optional)
                  </label>
                  <input
                    id="dp-website"
                    name="websiteOrSocial"
                    type="text"
                    value={form.websiteOrSocial}
                    onChange={(e) => handleFieldChange('websiteOrSocial', e.target.value)}
                    placeholder="https://... or @clinicpage"
                    aria-invalid={Boolean(fieldErrors.websiteOrSocial)}
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] text-[#102338] dark:text-[#F5FAFF] placeholder-[#46596A]/60 dark:placeholder-[#B8C8D8]/50 focus:outline-none focus:ring-2 focus:ring-[#087D94] dark:focus:ring-[#22D3D5]"
                  />
                  {fieldErrors.websiteOrSocial && (
                    <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                      {fieldErrors.websiteOrSocial}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="dp-primaryContact"
                    className="block text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] mb-1.5"
                  >
                    Primary Business Contact (Optional)
                  </label>
                  <input
                    id="dp-primaryContact"
                    name="primaryContact"
                    type="text"
                    value={form.primaryContact}
                    onChange={(e) => handleFieldChange('primaryContact', e.target.value)}
                    placeholder="Practice Manager / Coordinator"
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] text-[#102338] dark:text-[#F5FAFF] placeholder-[#46596A]/60 dark:placeholder-[#B8C8D8]/50 focus:outline-none focus:ring-2 focus:ring-[#087D94] dark:focus:ring-[#22D3D5]"
                  />
                </div>
              </div>
            </section>

            {/* Optional Add-Ons Selector */}
            {config.addons.length > 0 && (
              <section className="rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-6 sm:p-8 shadow-xs space-y-4">
                <h2 className="font-display text-lg font-bold text-[#102338] dark:text-[#F5FAFF]">
                  Optional Implementation Add-Ons
                </h2>
                <div className="space-y-3">
                  {config.addons.map((addon) => {
                    const checked = selectedAddonIds.includes(addon.id);
                    return (
                      <label
                        key={addon.id}
                        className="flex items-start gap-3 p-4 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAddon(addon.id)}
                          className="mt-1 h-4 w-4 accent-[#087D94] dark:accent-[#22D3D5]"
                        />
                        <span className="text-sm">
                          <span className="font-semibold text-[#102338] dark:text-[#F5FAFF] block">
                            {addon.label}
                          </span>
                          <span className="text-[#46596A] dark:text-[#B8C8D8]">
                            {addon.description}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Payment & Compliance Section */}
            <section className="rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#DCE7EE] dark:border-[#304258]">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#102338] dark:text-[#F5FAFF]">
                    Payment & Agreement
                  </h2>
                  <p className="mt-1 text-sm text-[#46596A] dark:text-[#B8C8D8]">
                    {totals.isTransactionalReady
                      ? `Processed via hosted ${config.paymentProviderName} integration.`
                      : 'Hosted payment provider connection required before live billing.'}
                  </p>
                </div>
                <span className="font-mono-tabular text-xs font-medium text-[#087D94] dark:text-[#22D3D5]">
                  State: {paymentState}
                </span>
              </div>

              {!totals.isTransactionalReady ? (
                <div className="rounded-2xl border border-dashed border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] p-5 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#102338] dark:text-[#F5FAFF]">
                    <Lock className="w-4 h-4 text-[#087D94] dark:text-[#22D3D5]" aria-hidden="true" />
                    <span>Hosted Payment Gateway Not Yet Connected</span>
                  </div>
                  <p className="text-sm text-[#46596A] dark:text-[#B8C8D8] leading-relaxed">
                    Dent Propel never collects raw card details in custom form fields. Once a
                    verified payment provider (such as PayFast, Safepay, or Stripe) and pricing
                    are configured in server environment settings, the hosted checkout step will
                    activate here.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] p-5 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#087D94] dark:text-[#22D3D5] mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="text-sm text-[#46596A] dark:text-[#B8C8D8]">
                    You will complete payment through our authorized{' '}
                    <strong className="text-[#102338] dark:text-[#F5FAFF]">
                      {config.paymentProviderName}
                    </strong>{' '}
                    hosted checkout. Recurring {config.pricing.billingInterval} obligations of{' '}
                    <strong className="font-mono-tabular text-[#102338] dark:text-[#F5FAFF]">
                      {formatMoney(totals.recurringTotalPerCycle, totals.currency)}
                    </strong>{' '}
                    apply after initial setup unless canceled per agreement terms.
                  </div>
                </div>
              )}

              {/* Legal & Consent Checkboxes */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="flex items-start gap-3 text-sm text-[#102338] dark:text-[#F5FAFF] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.termsAccepted}
                      onChange={(e) => handleFieldChange('termsAccepted', e.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#087D94] dark:accent-[#22D3D5]"
                    />
                    <span>
                      I accept the{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/terms')}
                        className="text-[#087D94] dark:text-[#22D3D5] underline cursor-pointer"
                      >
                        Terms of Service
                      </button>
                      . <span aria-hidden="true">*</span>
                    </span>
                  </label>
                  {fieldErrors.termsAccepted && (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                      {fieldErrors.termsAccepted}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-start gap-3 text-sm text-[#102338] dark:text-[#F5FAFF] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.privacyAccepted}
                      onChange={(e) => handleFieldChange('privacyAccepted', e.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#087D94] dark:accent-[#22D3D5]"
                    />
                    <span>
                      I have reviewed the{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/privacy')}
                        className="text-[#087D94] dark:text-[#22D3D5] underline cursor-pointer"
                      >
                        Privacy Policy
                      </button>
                      . <span aria-hidden="true">*</span>
                    </span>
                  </label>
                  {fieldErrors.privacyAccepted && (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                      {fieldErrors.privacyAccepted}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-start gap-3 text-sm text-[#102338] dark:text-[#F5FAFF] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.billingAgreementAccepted}
                      onChange={(e) =>
                        handleFieldChange('billingAgreementAccepted', e.target.checked)
                      }
                      className="mt-1 h-4 w-4 accent-[#087D94] dark:accent-[#22D3D5]"
                    />
                    <span>
                      I understand the package scope, excluded paid advertising spend, and billing
                      / cancellation terms. <span aria-hidden="true">*</span>
                    </span>
                  </label>
                  {fieldErrors.billingAgreementAccepted && (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                      {fieldErrors.billingAgreementAccepted}
                    </p>
                  )}
                </div>

                <label className="flex items-start gap-3 text-sm text-[#46596A] dark:text-[#B8C8D8] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.marketingConsent}
                    onChange={(e) => handleFieldChange('marketingConsent', e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#087D94] dark:accent-[#22D3D5]"
                  />
                  <span>
                    Optional: Send practice growth updates and onboarding tips to my business email.
                  </span>
                </label>
              </div>

              {serverError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/40 bg-red-50 dark:bg-red-950/30 p-4 flex items-start gap-3 text-sm text-red-700 dark:text-red-300"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{serverError}</span>
                </div>
              )}

              <div className="pt-2 space-y-3">
                {totals.isTransactionalReady ? (
                  <button
                    type="submit"
                    disabled={paymentState === 'processing'}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-base font-semibold text-white bg-[#087D94] hover:bg-[#06687C] dark:bg-gradient-to-r dark:from-[#22D3D5] dark:to-[#43B5EC] dark:text-[#080E1D] disabled:opacity-60 transition-all cursor-pointer"
                  >
                    {paymentState === 'processing' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                        <span>Processing Checkout...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Complete Payment</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] text-[#46596A] dark:text-[#B8C8D8] opacity-65 cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4" aria-hidden="true" />
                      <span>Confirm & Complete Payment (Requires Live Payment Gateway)</span>
                    </button>

                    <button
                      type="submit"
                      disabled={paymentState === 'processing'}
                      className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-base font-semibold text-white bg-[#087D94] hover:bg-[#06687C] dark:bg-gradient-to-r dark:from-[#22D3D5] dark:to-[#43B5EC] dark:text-[#080E1D] disabled:opacity-60 transition-all cursor-pointer"
                    >
                      {paymentState === 'processing' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                          <span>Saving Preview Application...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Clinic Application (Preview Mode)</span>
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </form>

          {/* Right Column: Sticky Order Summary */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-[#087D94]/35 dark:border-[#22D3D5]/45 bg-white dark:bg-[#152337] p-6 sm:p-8 shadow-[var(--dp-shadow)] space-y-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#087D94] dark:text-[#22D3D5]">
                  Order Summary
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#102338] dark:text-[#F5FAFF] mt-1">
                  Your Dent Propel Growth System
                </h2>
              </div>

              {/* Selected Deliverables List */}
              <div className="space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#46596A] dark:text-[#B8C8D8]">
                  Selected Scope ({selectedDeliverables.length} modules)
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm">
                  {selectedDeliverables.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-2 text-[#102338] dark:text-[#F5FAFF]"
                    >
                      <Check
                        className="w-3.5 h-3.5 text-[#087D94] dark:text-[#22D3D5] mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="leading-snug">{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Breakdown */}
              <dl className="space-y-3 text-sm pt-4 border-t border-[#DCE7EE] dark:border-[#304258]">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#46596A] dark:text-[#B8C8D8]">Setup Fee</dt>
                  <dd className="font-mono-tabular font-semibold text-[#102338] dark:text-[#F5FAFF]">
                    {config.pricing.isPricingConfigured
                      ? formatMoney(totals.setupFee, totals.currency)
                      : 'Pending Scoping'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#46596A] dark:text-[#B8C8D8]">
                    Management Fee ({config.pricing.billingInterval})
                  </dt>
                  <dd className="font-mono-tabular font-semibold text-[#102338] dark:text-[#F5FAFF]">
                    {config.pricing.isPricingConfigured
                      ? formatMoney(totals.monthlyFee, totals.currency)
                      : 'Pending Scoping'}
                  </dd>
                </div>
                {selectedAddonIds.length > 0 && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-[#46596A] dark:text-[#B8C8D8]">
                      Selected Add-Ons ({selectedAddonIds.length})
                    </dt>
                    <dd className="font-mono-tabular font-semibold text-[#102338] dark:text-[#F5FAFF]">
                      {config.pricing.isPricingConfigured
                        ? formatMoney(
                            (totals.addonsSetupTotal ?? 0) + (totals.addonsMonthlyTotal ?? 0),
                            totals.currency,
                          )
                        : 'Scoped'}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#46596A] dark:text-[#B8C8D8]">
                    Applicable Tax ({config.pricing.taxRatePercent}%)
                  </dt>
                  <dd className="font-mono-tabular font-semibold text-[#102338] dark:text-[#F5FAFF]">
                    {config.pricing.isPricingConfigured
                      ? formatMoney(totals.taxAmountDueNow, totals.currency)
                      : 'Calculated at quote'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#DCE7EE] dark:border-[#304258]">
                  <dt className="font-display text-base font-bold text-[#102338] dark:text-[#F5FAFF]">
                    Total Payable Now
                  </dt>
                  <dd className="font-display font-mono-tabular text-lg font-bold text-[#087D94] dark:text-[#22D3D5]">
                    {config.pricing.isPricingConfigured
                      ? formatMoney(totals.totalDueNow, totals.currency)
                      : 'Preview Mode (0.00)'}
                  </dd>
                </div>
              </dl>

              <div className="rounded-xl bg-[#F6F9FC] dark:bg-[#101B2B] border border-[#DCE7EE] dark:border-[#304258] p-4 space-y-2 text-xs text-[#46596A] dark:text-[#B8C8D8] leading-relaxed">
                <p>
                  <strong className="text-[#102338] dark:text-[#F5FAFF]">Excluded Costs:</strong>{' '}
                  Paid ad spend and optional third-party software licenses are billed directly by
                  those platforms.
                </p>
                <p>{config.pricing.cancellationTerms}</p>
              </div>

              <div className="pt-2 border-t border-[#DCE7EE] dark:border-[#304258] space-y-2.5">
                <p className="text-xs text-[#46596A] dark:text-[#B8C8D8]">
                  Prefer to claim or discuss this package directly without waiting?
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] border border-[#087D94]/40 dark:border-[#22D3D5]/45 bg-[#F6F9FC] dark:bg-[#101B2B] hover:bg-[#EAF8FA] dark:hover:bg-[#1B2C42] transition-colors whitespace-nowrap"
                >
                  <MessageCircle
                    className="w-4 h-4 text-[#087D94] dark:text-[#22D3D5] shrink-0"
                    aria-hidden="true"
                  />
                  <span>Message on WhatsApp (0306-0069993)</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
