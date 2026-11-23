import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, Info, Lock, MessageCircle, SlidersHorizontal } from 'lucide-react';
import { useFunnel } from '../context/FunnelContext';
import {
  buildWhatsAppRedirectUrl,
  calculateOfferTotals,
  formatMoney,
} from '../lib/funnelLogic';
import { KineticReveal, MotionTiltCard, ScrollFeatureCard } from './MotionPrimitives';

export function OfferSection() {
  const {
    config,
    selectedDeliverableIds,
    toggleDeliverable,
    selectedAddonIds,
    toggleAddon,
    navigate,
  } = useFunnel();

  const totals = calculateOfferTotals(
    config,
    selectedDeliverableIds,
    selectedAddonIds,
  );

  const selectedLabels = config.deliverables
    .filter((d) => selectedDeliverableIds.includes(d.id))
    .map((d) => d.label);

  const whatsappUrl = buildWhatsAppRedirectUrl(
    config.contact.whatsapp,
    `Hello Dent Propel, I would like to claim/discuss the Dent Propel Growth System (${selectedLabels.length} selected modules: ${selectedLabels.slice(0, 4).join(', ')}${selectedLabels.length > 4 ? '...' : ''}).`,
  );

  const groups: ('Growth & Marketing' | 'Lead & Automation' | 'Visibility & Reporting')[] = [
    'Growth & Marketing',
    'Lead & Automation',
    'Visibility & Reporting',
  ];

  return (
    <section
      id="offer"
      className="py-14 lg:py-20 scroll-mt-20"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <KineticReveal className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase text-[#087D94] dark:text-[#22D3D5] mb-2">
            The Core Offer
          </p>
          <h2 className="font-display text-2xl sm:text-4xl lg:text-[42px] leading-[1.12] font-bold tracking-tight text-[#102338] dark:text-[#F5FAFF] text-balance">
            Your Complete Dental Growth System.
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#46596A] dark:text-[#B8C8D8]">
            Select your clinic’s modules below, then apply via form or message us directly on WhatsApp.
          </p>
        </KineticReveal>

        {/* Streamlined Flagship Offer Card */}
        <ScrollFeatureCard direction="scale" distance={24} large>
          <MotionTiltCard
            intensity={1.4}
            className="rounded-3xl border border-[#087D94]/40 dark:border-[#22D3D5]/50 bg-white dark:bg-[#152337] p-5 sm:p-8 lg:p-10 shadow-[var(--dp-shadow)]"
          >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 right-0 w-[400px] h-[400px] rounded-full bg-[#13AFA8]/10 dark:bg-[#22D3D5]/12 blur-[100px]"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Compact Configurable Scope */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#087D94] dark:text-[#22D3D5]">
                  Flagship Engagement
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#102338] dark:text-[#F5FAFF] mt-1">
                  DENT PROPEL GROWTH SYSTEM
                </h3>
              </div>

              <div className="space-y-4">
                {groups.map((group) => {
                  const items = config.deliverables.filter((d) => d.group === group);
                  return (
                    <div key={group} className="space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[#DCE7EE] dark:border-[#304258] pb-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#46596A] dark:text-[#B8C8D8]">
                          {group}
                        </span>
                        <span className="text-[11px] text-[#46596A] dark:text-[#B8C8D8]">
                          Click to toggle optional modules
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {items.map((item) => {
                          const isSelected = selectedDeliverableIds.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={!item.configurable}
                              onClick={() => toggleDeliverable(item.id)}
                              aria-pressed={isSelected}
                              className={`text-left px-3.5 py-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                                isSelected
                                  ? 'bg-[#F6F9FC] dark:bg-[#101B2B] border-[#087D94]/60 dark:border-[#22D3D5]/60'
                                  : 'bg-[#F6F9FC]/45 dark:bg-[#101B2B]/40 border-[#DCE7EE] dark:border-[#304258] opacity-70'
                              } ${item.configurable ? 'cursor-pointer hover:border-[#087D94] dark:hover:border-[#22D3D5]' : 'cursor-default'}`}
                            >
                              <span
                                className={`w-4 h-4 rounded-sm flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? 'bg-[#087D94] dark:bg-[#22D3D5] border-[#087D94] dark:border-[#22D3D5] text-white dark:text-[#080E1D]'
                                    : 'border-[#DCE7EE] dark:border-[#304258] bg-transparent'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" aria-hidden="true" />}
                              </span>
                              <span className="text-xs sm:text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] leading-snug">
                                {item.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Optional Add-ons */}
              {config.addons.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#46596A] dark:text-[#B8C8D8]">
                    <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Optional Add-Ons</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {config.addons.map((addon) => {
                      const active = selectedAddonIds.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => toggleAddon(addon.id)}
                          aria-pressed={active}
                          className={`text-left px-3.5 py-2.5 rounded-xl border transition-colors flex items-center gap-2.5 cursor-pointer ${
                            active
                              ? 'bg-[#F6F9FC] dark:bg-[#101B2B] border-[#087D94] dark:border-[#22D3D5]'
                              : 'bg-[#F6F9FC]/50 dark:bg-[#101B2B]/50 border-[#DCE7EE] dark:border-[#304258] hover:border-[#087D94]/50'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-sm flex items-center justify-center shrink-0 border ${
                              active
                                ? 'bg-[#087D94] dark:bg-[#22D3D5] border-[#087D94] dark:border-[#22D3D5] text-white dark:text-[#080E1D]'
                                : 'border-[#DCE7EE] dark:border-[#304258]'
                            }`}
                          >
                            {active && <Check className="w-3 h-3" aria-hidden="true" />}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] leading-snug">
                            {addon.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Pricing Summary + Dual Claim Paths (Form & WhatsApp) */}
            <div className="lg:col-span-5 rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] p-6 sm:p-7 space-y-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#087D94] dark:text-[#22D3D5]">
                  Get Started
                </div>
                <div className="mt-1.5 font-display text-2xl font-bold text-[#102338] dark:text-[#F5FAFF] font-mono-tabular">
                  {config.pricing.isPricingConfigured
                    ? `${formatMoney(totals.totalDueNow, totals.currency)}`
                    : 'Custom Clinic Scoping'}
                </div>
                <p className="mt-1 text-xs text-[#46596A] dark:text-[#B8C8D8]">
                  {totals.selectedDeliverableCount} modules selected · Paid ad budget billed directly to ad platform
                </p>
              </div>

              {!totals.isTransactionalReady && (
                <div className="rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-3.5 flex items-start gap-2.5 text-xs text-[#46596A] dark:text-[#B8C8D8]">
                  <Info className="w-4 h-4 text-[#087D94] dark:text-[#22D3D5] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    Preview mode active — submit the scoping form or message us on WhatsApp with no upfront card charge.
                  </span>
                </div>
              )}

              <dl className="space-y-2.5 text-sm border-y border-[#DCE7EE] dark:border-[#304258] py-4">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#46596A] dark:text-[#B8C8D8]">Setup Fee</dt>
                  <dd className="font-mono-tabular font-semibold text-[#102338] dark:text-[#F5FAFF]">
                    {config.pricing.isPricingConfigured
                      ? formatMoney(totals.setupFee, totals.currency)
                      : 'Scoped per clinic'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#46596A] dark:text-[#B8C8D8]">
                    Management ({config.pricing.billingInterval})
                  </dt>
                  <dd className="font-mono-tabular font-semibold text-[#102338] dark:text-[#F5FAFF]">
                    {config.pricing.isPricingConfigured
                      ? formatMoney(totals.monthlyFee, totals.currency)
                      : 'Scoped per clinic'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[#46596A] dark:text-[#B8C8D8]">Paid Ad Budget</dt>
                  <dd className="font-medium text-[#087D94] dark:text-[#22D3D5]">
                    Direct to Ad Platform
                  </dd>
                </div>
              </dl>

              {/* Option 1: Application Form + Option 2: Direct WhatsApp Redirect */}
              <div className="space-y-3">
                <motion.button
                  type="button"
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate('/checkout')}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-white bg-[#087D94] hover:bg-[#06687C] dark:bg-gradient-to-r dark:from-[#22D3D5] dark:to-[#43B5EC] dark:text-[#080E1D] shadow-md transition-colors whitespace-nowrap cursor-pointer"
                >
                  {!totals.isTransactionalReady && (
                    <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
                  )}
                  <span>Get My Dent Propel Growth System</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </motion.button>

                <motion.a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-[#102338] dark:text-[#F5FAFF] border border-[#087D94]/40 dark:border-[#22D3D5]/45 bg-white dark:bg-[#152337] hover:bg-[#EAF8FA] dark:hover:bg-[#1B2C42] transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 text-[#087D94] dark:text-[#22D3D5] shrink-0" aria-hidden="true" />
                  <span>Claim via WhatsApp (0306-0069993)</span>
                </motion.a>
              </div>
            </div>
          </div>
          </MotionTiltCard>
        </ScrollFeatureCard>
      </div>
    </section>
  );
}

