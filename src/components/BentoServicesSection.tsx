import React from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  Bot,
  Check,
  LayoutGrid,
  Target,
} from 'lucide-react';
import { KineticReveal, MotionTiltCard, ScrollFeatureCard } from './MotionPrimitives';

export function BentoServicesSection() {
  return (
    <section
      id="solutions"
      className="py-14 lg:py-20 scroll-mt-20 overflow-x-clip"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <KineticReveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase text-[#087D94] dark:text-[#22D3D5] mb-2">
              Core Capabilities
            </p>
            <h2 className="font-display text-2xl sm:text-4xl lg:text-[40px] leading-[1.15] font-bold tracking-tight text-[#102338] dark:text-[#F5FAFF] text-balance">
              Everything Essential for Organized Clinic Growth.
            </h2>
          </div>
          <p className="text-xs font-mono-tabular text-[#46596A] dark:text-[#B8C8D8] shrink-0">
            Four connected pillars · Custom-scoped per clinic
          </p>
        </KineticReveal>

        {/* Streamlined 4-Card Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Card 01: Social Media & Positioning (7 cols) */}
          <ScrollFeatureCard
            index={0}
            direction="left"
            distance={28}
            className="md:col-span-7"
          >
            <MotionTiltCard
              intensity={3.5}
              className="h-full rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-6 sm:p-7 hover:border-[#087D94]/60 dark:hover:border-[#22D3D5]/60 transition-colors"
            >
              <article className="relative z-10 h-full flex flex-col justify-between gap-5">
                <div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#087D94] dark:text-[#22D3D5] mb-3">
                    <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                    <span>01 · Social Media & Authority</span>
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#102338] dark:text-[#F5FAFF]">
                    Consistent, Patient-Facing Presence.
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-[#46596A] dark:text-[#B8C8D8]">
                    Educational reels, doctor authority posts, and scheduled publishing built around your top treatments.
                  </p>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-[#DCE7EE] dark:border-[#304258] text-xs sm:text-sm font-medium text-[#102338] dark:text-[#F5FAFF]">
                  {['Treatment reels & posts', 'Brand consistency', 'Publishing management'].map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#087D94] dark:text-[#22D3D5] shrink-0" aria-hidden="true" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </MotionTiltCard>
          </ScrollFeatureCard>

          {/* Card 02: Paid Campaigns & Lead Capture (5 cols) */}
          <ScrollFeatureCard
            index={1}
            direction="right"
            distance={28}
            className="md:col-span-5"
          >
            <MotionTiltCard
              intensity={4}
              className="h-full rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-6 sm:p-7 hover:border-[#087D94]/60 dark:hover:border-[#22D3D5]/60 transition-colors"
            >
              <article className="relative z-10 h-full flex items-center justify-between gap-4">
                <div className="space-y-2.5">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#087D94] dark:text-[#22D3D5]">
                    <Target className="w-4 h-4" aria-hidden="true" />
                    <span>02 · Targeted Ads & Leads</span>
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#102338] dark:text-[#F5FAFF]">
                    Reach Relevant Local Patients.
                  </h3>
                  <p className="text-sm text-[#46596A] dark:text-[#B8C8D8]">
                    Local Meta campaigns and dedicated landing forms that route inquiries cleanly into one pipeline.
                  </p>
                </div>

                {/* Animated Radar Graphic */}
                <svg viewBox="0 0 64 64" className="w-16 h-16 shrink-0" aria-hidden="true">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" className="text-[#DCE7EE] dark:text-[#304258]" strokeWidth="1.5" />
                  <circle cx="32" cy="32" r="15" fill="none" stroke="currentColor" className="text-[#DCE7EE] dark:text-[#304258]" strokeWidth="1" strokeDasharray="3 3" />
                  <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                    style={{ transformOrigin: '32px 32px' }}
                  >
                    <line x1="32" y1="32" x2="32" y2="6" stroke="#22D3D5" strokeWidth="2" strokeLinecap="round" />
                  </motion.g>
                  <circle cx="32" cy="32" r="3.5" fill="#087D94" />
                </svg>
              </article>
            </MotionTiltCard>
          </ScrollFeatureCard>

          {/* Card 03: AI Automation & Follow-Up (5 cols) */}
          <ScrollFeatureCard
            index={2}
            direction="left"
            distance={28}
            className="md:col-span-5"
          >
            <MotionTiltCard
              intensity={4}
              className="h-full rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-6 sm:p-7 hover:border-[#087D94]/60 dark:hover:border-[#22D3D5]/60 transition-colors"
            >
              <article className="relative z-10 h-full flex flex-col justify-between gap-5">
                <div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#087D94] dark:text-[#22D3D5] mb-3">
                    <Bot className="w-4 h-4" aria-hidden="true" />
                    <span>03 · AI Follow-Up Automation</span>
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#102338] dark:text-[#F5FAFF]">
                    Instant Reply. Less Manual Chasing.
                  </h3>
                  <p className="mt-2 text-sm text-[#46596A] dark:text-[#B8C8D8]">
                    Automated acknowledgments, staff notifications, and structured reception handoffs.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#DCE7EE] dark:border-[#304258] text-xs font-semibold text-[#102338] dark:text-[#F5FAFF]">
                  <span>Inquiry</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    aria-hidden="true"
                    className="text-[#087D94] dark:text-[#22D3D5]"
                  >
                    →
                  </motion.span>
                  <span>Auto Reply</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, delay: 0.4, ease: 'easeInOut' }}
                    aria-hidden="true"
                    className="text-[#087D94] dark:text-[#22D3D5]"
                  >
                    →
                  </motion.span>
                  <span>Front Desk</span>
                </div>
              </article>
            </MotionTiltCard>
          </ScrollFeatureCard>

          {/* Card 04: Booking & Clear Reporting (7 cols) */}
          <ScrollFeatureCard
            index={3}
            direction="right"
            distance={28}
            className="md:col-span-7"
          >
            <MotionTiltCard
              intensity={3.5}
              className="h-full rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-6 sm:p-7 hover:border-[#087D94]/60 dark:hover:border-[#22D3D5]/60 transition-colors"
            >
              <article className="relative z-10 h-full flex items-center justify-between gap-6">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#087D94] dark:text-[#22D3D5]">
                    <BarChart3 className="w-4 h-4" aria-hidden="true" />
                    <span>04 · Booking & Clear Visibility</span>
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#102338] dark:text-[#F5FAFF]">
                    Track Inquiries Through to Appointments.
                  </h3>
                  <p className="text-sm sm:text-base text-[#46596A] dark:text-[#B8C8D8]">
                    Clear reporting connecting ad spend, lead sources, follow-up progress, and consultation requests.
                  </p>
                </div>

                {/* Animated Insight Bars Graphic */}
                <div className="hidden sm:flex items-end gap-1.5 h-16 px-2 shrink-0" aria-hidden="true">
                  {[0.45, 0.7, 0.55, 0.88, 1.0].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0.25 }}
                      whileInView={{ scaleY: h }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      style={{ transformOrigin: 'bottom', height: '100%' }}
                      className="w-2.5 rounded-t-sm bg-gradient-to-t from-[#087D94] to-[#22D3D5]"
                    />
                  ))}
                </div>
              </article>
            </MotionTiltCard>
          </ScrollFeatureCard>
        </div>
      </div>
    </section>
  );
}

