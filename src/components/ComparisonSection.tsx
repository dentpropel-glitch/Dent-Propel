import React from 'react';
import { CheckCircle2, MinusCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { MotionTiltCard } from './MotionPrimitives';

const COMPARISON_ROWS = [
  {
    without: 'Scattered inquiries across DMs, calls, and forms',
    withSystem: 'Structured inquiry capture into one intake view',
  },
  {
    without: 'Separate marketing channels operating in silos',
    withSystem: 'Organized lead records tied to campaign sources',
  },
  {
    without: 'Manual follow-up without consistent tracking',
    withSystem: 'Automated workflow support and timely staff alerts',
  },
  {
    without: 'Limited campaign visibility after ads run',
    withSystem: 'Consolidated reporting across inquiry and booking stages',
  },
  {
    without: 'Disconnected booking information at reception',
    withSystem: 'Clearer appointment handoff processes for front-desk staff',
  },
];

export function ComparisonSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-12 lg:mb-16">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase text-[#087D94] dark:text-[#22D3D5] mb-3">
            System Contrast
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[46px] leading-[1.15] font-bold tracking-tight text-[#102338] dark:text-[#F5FAFF] text-balance">
            From Disconnected Marketing to a Connected Growth Process.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left: Without a Connected System */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-white/75 dark:bg-[#101B2B]/80 p-7 sm:p-9"
          >
            <div className="pb-5 mb-6 border-b border-[#DCE7EE] dark:border-[#304258]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#46596A] dark:text-[#B8C8D8]">
                Fragmented Approach
              </span>
              <h3 className="font-display text-2xl font-bold text-[#102338] dark:text-[#F5FAFF] mt-1">
                Without a Connected System
              </h3>
            </div>

            <ul className="space-y-4">
              {COMPARISON_ROWS.map((row, idx) => (
                <motion.li
                  key={row.without}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="flex items-start gap-3.5 text-base text-[#46596A] dark:text-[#B8C8D8]"
                >
                  <MinusCircle
                    className="w-5 h-5 text-[#46596A]/70 dark:text-[#B8C8D8]/60 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{row.without}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right: With Dent Propel */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <MotionTiltCard
              intensity={3.5}
              className="h-full rounded-3xl border border-[#087D94]/45 dark:border-[#22D3D5]/55 bg-white dark:bg-[#152337] p-7 sm:p-9 shadow-[var(--dp-shadow)]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#13AFA8]/10 dark:bg-[#22D3D5]/12 blur-3xl"
              />
              <div className="relative z-10">
                <div className="pb-5 mb-6 border-b border-[#DCE7EE] dark:border-[#304258]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#087D94] dark:text-[#22D3D5]">
                    Integrated Architecture
                  </span>
                  <h3 className="font-display text-2xl font-bold text-[#102338] dark:text-[#F5FAFF] mt-1">
                    With Dent Propel
                  </h3>
                </div>

                <ul className="space-y-4">
                  {COMPARISON_ROWS.map((row, idx) => (
                    <motion.li
                      key={row.withSystem}
                      initial={{ opacity: 0, x: 8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: idx * 0.06 }}
                      className="flex items-start gap-3.5 text-base font-medium text-[#102338] dark:text-[#F5FAFF]"
                    >
                      <CheckCircle2
                        className="w-5 h-5 text-[#087D94] dark:text-[#22D3D5] mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{row.withSystem}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </MotionTiltCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
