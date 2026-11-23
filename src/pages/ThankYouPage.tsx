import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';
import { useFunnel } from '../context/FunnelContext';
import {
  buildWhatsAppRedirectUrl,
  deriveThankYouDisplayState,
  formatMoney,
  type OrderRecord,
} from '../lib/funnelLogic';

export function ThankYouPage() {
  const { searchParams, lastOrderId, config, navigate } = useFunnel();
  const orderId = searchParams.get('orderId') || lastOrderId || '';

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationNote, setVerificationNote] = useState<string | null>(null);

  const [showOnboardingForm, setShowOnboardingForm] = useState(false);
  const [showSupportNote, setShowSupportNote] = useState(false);
  const [practiceSize, setPracticeSize] = useState('Independent Dental Clinic');
  const [priorityServices, setPriorityServices] = useState('');
  const [currentTools, setCurrentTools] = useState('');
  const [savingOnboarding, setSavingOnboarding] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
      if (!resp.ok) {
        setOrder(null);
      } else {
        const data = await resp.json();
        setOrder(data.order || null);
      }
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleRetryVerification = async () => {
    if (!orderId) return;
    setVerifying(true);
    setVerificationNote(null);
    try {
      const resp = await fetch(`/api/orders/${encodeURIComponent(orderId)}/verify`, {
        method: 'POST',
      });
      const data = await resp.json();
      if (data.order) {
        setOrder(data.order);
      }
      if (data.message) {
        setVerificationNote(data.message);
      }
    } catch {
      setVerificationNote('Could not reach verification endpoint. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleStartOnboarding = async () => {
    if (!orderId) return;
    setShowOnboardingForm(true);
    if (order?.onboardingStatus === 'not_started') {
      try {
        const resp = await fetch(`/api/orders/${encodeURIComponent(orderId)}/onboarding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'start' }),
        });
        const data = await resp.json();
        if (data.order) setOrder(data.order);
      } catch {
        // Non-blocking
      }
    }
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    setSavingOnboarding(true);
    try {
      const resp = await fetch(`/api/orders/${encodeURIComponent(orderId)}/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          practiceSize,
          priorityServices,
          currentTools,
        }),
      });
      const data = await resp.json();
      if (data.order) {
        setOrder(data.order);
        setShowOnboardingForm(false);
      }
    } finally {
      setSavingOnboarding(false);
    }
  };

  if (loading) {
    return (
      <main className="py-24">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#087D94] dark:text-[#22D3D5] mx-auto" />
          <p className="text-base text-[#46596A] dark:text-[#B8C8D8]">
            Verifying your clinic order status with the server...
          </p>
        </div>
      </main>
    );
  }

  const display = deriveThankYouDisplayState(order);

  const whatsappUrl = buildWhatsAppRedirectUrl(
    config.contact.whatsapp,
    `Hello Dent Propel, I submitted my clinic application${
      order?.id ? ` (${order.id})` : ''
    }${order?.clinicDetails.clinicName ? ` for ${order.clinicDetails.clinicName}` : ''}. Let’s discuss next steps.`,
  );

  return (
    <main className="relative py-12 sm:py-20 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[360px] rounded-full bg-[#13AFA8]/10 dark:bg-[#22D3D5]/12 blur-[110px]"
      />

      <div className="relative z-10 max-w-[920px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Main Confirmation / Verification Card */}
        <section className="rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-7 sm:p-10 shadow-[var(--dp-shadow)] text-center space-y-5">
          <div className="flex justify-center">
            {display.showSuccessConfirmation ? (
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EAF8FA] dark:bg-[#1B2C42] border border-[#087D94]/40 dark:border-[#22D3D5]/50 text-[#087D94] dark:text-[#22D3D5]">
                <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
              </span>
            ) : display.status === 'pending' ? (
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EAF8FA] dark:bg-[#1B2C42] border border-[#087D94]/40 dark:border-[#22D3D5]/50 text-[#087D94] dark:text-[#22D3D5]">
                <Clock className="w-8 h-8" aria-hidden="true" />
              </span>
            ) : (
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-8 h-8" aria-hidden="true" />
              </span>
            )}
          </div>

          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#087D94] dark:text-[#22D3D5]">
            {display.badgeText}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-[46px] leading-[1.12] font-bold tracking-tight text-[#102338] dark:text-[#F5FAFF] text-balance">
            {display.headline}
          </h1>

          <p className="font-display text-lg sm:text-xl font-semibold text-[#102338] dark:text-[#F5FAFF]">
            {display.subheadline}
          </p>

          <p className="text-base leading-relaxed text-[#46596A] dark:text-[#B8C8D8] max-w-2xl mx-auto">
            {display.description}
          </p>

          {verificationNote && (
            <p className="text-sm font-medium text-[#087D94] dark:text-[#22D3D5]">
              {verificationNote}
            </p>
          )}

          {/* Primary / Recovery Actions */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            {display.canStartOnboarding && (
              <button
                type="button"
                onClick={handleStartOnboarding}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-white bg-[#087D94] hover:bg-[#06687C] dark:bg-gradient-to-r dark:from-[#22D3D5] dark:to-[#43B5EC] dark:text-[#080E1D] transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>
                  {order?.onboardingStatus === 'completed'
                    ? 'Update Clinic Onboarding'
                    : 'Complete Clinic Onboarding'}
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>
            )}

            {display.canRetryVerification && (
              <button
                type="button"
                disabled={verifying}
                onClick={handleRetryVerification}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] hover:border-[#087D94] dark:hover:border-[#22D3D5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RefreshCw
                  className={`w-4 h-4 shrink-0 ${verifying ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span>Refresh Verification Check</span>
              </button>
            )}

            {display.canReturnToCheckout && (
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-white bg-[#087D94] dark:bg-[#22D3D5] dark:text-[#080E1D] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Return to Checkout</span>
              </button>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] border border-[#087D94]/40 dark:border-[#22D3D5]/45 bg-[#F6F9FC] dark:bg-[#101B2B] hover:bg-[#EAF8FA] dark:hover:bg-[#1B2C42] transition-colors whitespace-nowrap shrink-0"
            >
              <MessageCircle
                className="w-4 h-4 text-[#087D94] dark:text-[#22D3D5] shrink-0"
                aria-hidden="true"
              />
              <span>WhatsApp · 0306-0069993</span>
            </a>

            {config.contact.email ? (
              <a
                href={`mailto:${config.contact.email}?subject=${encodeURIComponent(
                  `Dent Propel Inquiry — ${order?.id || 'Clinic Support'}`,
                )}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] border border-[#DCE7EE] dark:border-[#304258] hover:border-[#087D94] dark:hover:border-[#22D3D5] transition-colors whitespace-nowrap shrink-0"
              >
                <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Contact Dent Propel</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setShowSupportNote((prev) => !prev)}
                aria-expanded={showSupportNote}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] border border-[#DCE7EE] dark:border-[#304258] hover:border-[#087D94] dark:hover:border-[#22D3D5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Contact Dent Propel</span>
              </button>
            )}

            {config.bookingCalendarUrl && display.canStartOnboarding && (
              <a
                href={config.bookingCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-[#087D94] dark:text-[#22D3D5] border border-[#087D94]/40 dark:border-[#22D3D5]/40 hover:bg-[#EAF8FA] dark:hover:bg-[#1B2C42] transition-colors whitespace-nowrap shrink-0"
              >
                <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Schedule a Kickoff Call</span>
              </a>
            )}
          </div>

          {showSupportNote && !config.contact.email && (
            <div className="mt-4 rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] p-4 text-sm text-[#46596A] dark:text-[#B8C8D8] text-left max-w-xl mx-auto">
              Your clinic order reference{' '}
              <span className="font-mono-tabular font-semibold text-[#102338] dark:text-[#F5FAFF]">
                {order?.id || 'is saved'}
              </span>{' '}
              has been logged for team follow-up at{' '}
              <span className="font-semibold text-[#102338] dark:text-[#F5FAFF]">
                {order?.clinicDetails.email || 'your submitted business email'}
              </span>
              . Configure <code className="font-mono-tabular text-xs">CONTACT_EMAIL</code> in
              environment settings to enable direct mailto links.
            </div>
          )}
        </section>

        {/* Interactive Clinic Onboarding Form (when activated) */}
        {showOnboardingForm && order && (
          <section className="rounded-3xl border border-[#087D94]/40 dark:border-[#22D3D5]/50 bg-white dark:bg-[#152337] p-6 sm:p-8 shadow-xs">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#102338] dark:text-[#F5FAFF]">
              Clinic Discovery Onboarding
            </h2>
            <p className="mt-1 text-sm text-[#46596A] dark:text-[#B8C8D8]">
              Share your practice setup so our implementation team can prepare your workflow plan.
            </p>

            <form onSubmit={handleCompleteOnboarding} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="dp-practiceSize"
                  className="block text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] mb-1.5"
                >
                  Practice Profile
                </label>
                <select
                  id="dp-practiceSize"
                  value={practiceSize}
                  onChange={(e) => setPracticeSize(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] text-[#102338] dark:text-[#F5FAFF]"
                >
                  <option>Independent Dental Clinic</option>
                  <option>Established Dental Practice</option>
                  <option>Multi-Dentist Practice</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="dp-priorityServices"
                  className="block text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] mb-1.5"
                >
                  Priority Dental Services to Highlight
                </label>
                <input
                  id="dp-priorityServices"
                  type="text"
                  value={priorityServices}
                  onChange={(e) => setPriorityServices(e.target.value)}
                  placeholder="e.g., Implants, Clear Aligners, Aesthetic Dentistry"
                  className="w-full px-4 py-3 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] text-[#102338] dark:text-[#F5FAFF]"
                />
              </div>

              <div>
                <label
                  htmlFor="dp-currentTools"
                  className="block text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] mb-1.5"
                >
                  Current Clinic Inquiry & Booking Tools
                </label>
                <input
                  id="dp-currentTools"
                  type="text"
                  value={currentTools}
                  onChange={(e) => setCurrentTools(e.target.value)}
                  placeholder="e.g., WhatsApp Business, Google Sheets, Clinic Desk Software"
                  className="w-full px-4 py-3 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] text-[#102338] dark:text-[#F5FAFF]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingOnboarding}
                  className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#087D94] dark:bg-[#22D3D5] dark:text-[#080E1D] cursor-pointer"
                >
                  {savingOnboarding ? 'Saving Discovery Details...' : 'Save Onboarding Details'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOnboardingForm(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-[#46596A] dark:text-[#B8C8D8] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Order Confirmation Card */}
        {order && (
          <section className="rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-6 sm:p-8 shadow-xs">
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#102338] dark:text-[#F5FAFF] pb-4 border-b border-[#DCE7EE] dark:border-[#304258]">
              Order & Clinic Reference Details
            </h2>

            <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <dt className="text-[#46596A] dark:text-[#B8C8D8]">Order Reference</dt>
                <dd className="mt-0.5 font-mono-tabular font-semibold text-[#102338] dark:text-[#F5FAFF]">
                  {order.id}
                </dd>
              </div>
              <div>
                <dt className="text-[#46596A] dark:text-[#B8C8D8]">Dental Clinic Name</dt>
                <dd className="mt-0.5 font-semibold text-[#102338] dark:text-[#F5FAFF]">
                  {order.clinicDetails.clinicName} ({order.clinicDetails.city})
                </dd>
              </div>
              <div>
                <dt className="text-[#46596A] dark:text-[#B8C8D8]">Selected Package</dt>
                <dd className="mt-0.5 font-semibold text-[#102338] dark:text-[#F5FAFF]">
                  {order.offerName} ({order.selectedDeliverableIds.length} modules)
                </dd>
              </div>
              <div>
                <dt className="text-[#46596A] dark:text-[#B8C8D8]">Payment Status</dt>
                <dd className="mt-0.5 font-semibold text-[#087D94] dark:text-[#22D3D5] capitalize">
                  {order.previewMode
                    ? 'Preview Mode (Pending Gateway)'
                    : order.paymentStatus.replace('_', ' ')}
                </dd>
              </div>
              <div>
                <dt className="text-[#46596A] dark:text-[#B8C8D8]">Amount Recorded</dt>
                <dd className="mt-0.5 font-mono-tabular font-semibold text-[#102338] dark:text-[#F5FAFF]">
                  {order.pricingSnapshot.isTransactionalReady
                    ? formatMoney(
                        order.pricingSnapshot.totalDueNow,
                        order.pricingSnapshot.currency,
                      )
                    : '0.00 (Preview Application)'}
                </dd>
              </div>
              <div>
                <dt className="text-[#46596A] dark:text-[#B8C8D8]">Submission Date & Billing</dt>
                <dd className="mt-0.5 font-mono-tabular text-[#102338] dark:text-[#F5FAFF]">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  · {order.pricingSnapshot.billingInterval}
                </dd>
              </div>
              <div>
                <dt className="text-[#46596A] dark:text-[#B8C8D8]">Onboarding Status</dt>
                <dd className="mt-0.5 font-semibold text-[#102338] dark:text-[#F5FAFF] capitalize">
                  {order.onboardingStatus.replace('_', ' ')}
                </dd>
              </div>
            </dl>
          </section>
        )}

        {/* Three-Stage Onboarding Timeline */}
        <section className="rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-6 sm:p-8 shadow-xs">
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#102338] dark:text-[#F5FAFF] mb-6">
            Next Steps: Your Onboarding Sequence
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                code: '01',
                title: 'Confirmation',
                text: 'Your order confirmation will be sent to your provided business email.',
              },
              {
                code: '02',
                title: 'Clinic Discovery',
                text: 'We’ll collect essential information about your practice, marketing priorities, and current workflows.',
              },
              {
                code: '03',
                title: 'Implementation Planning',
                text: 'Our team will review the agreed scope and prepare your implementation process.',
              },
            ].map((stage) => (
              <div
                key={stage.code}
                className="rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] p-5 space-y-2"
              >
                <span className="font-mono-tabular text-xs font-semibold text-[#087D94] dark:text-[#22D3D5]">
                  {stage.code} — {stage.title}
                </span>
                <p className="text-sm leading-relaxed text-[#46596A] dark:text-[#B8C8D8]">
                  {stage.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
