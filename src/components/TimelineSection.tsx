import React from 'react';
import { motion } from 'motion/react';

const STEPS = [
  {
    code: '01',
    title: 'Discover',
    description:
      'We understand your practice, key services, marketing activity, inquiry handling, and growth priorities.',
  },
  {
    code: '02',
    title: 'Strategize',
    description:
      'We plan the connected marketing, lead capture, follow-up, and measurement processes appropriate to your clinic.',
  },
  {
    code: '03',
    title: 'Implement',
    description:
      'We configure the agreed marketing assets, systems, and workflows.',
  },
  {
    code: '04',
    title: 'Optimize',
    description:
      'We monitor performance indicators and improve the system based on available data and operational feedback.',
  },
];

export function TimelineSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 lg:py-28 bg-white dark:bg-[#101B2B] border-y border-[#DCE7EE] dark:border-[#304258] scroll-mt-20"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-12 lg:mb-16">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase text-[#087D94] dark:text-[#22D3D5] mb-3">
            How Dent Propel Works
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[46px] leading-[1.15] font-bold tracking-tight text-[#102338] dark:text-[#F5FAFF] text-balance">
            From Clinic Discovery to a Connected Growth Process.
          </h2>
        </div>

        {/* Desktop Horizontal Timeline with Animated Draw Beam */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-7 left-[6%] right-[6%] h-[2px] bg-[#DCE7EE] dark:bg-[#304258] overflow-hidden"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'left' }}
              className="h-full w-full bg-gradient-to-r from-[#087D94] via-[#13AFA8] to-[#6476ED] dark:from-[#22D3D5] dark:via-[#43B5EC] dark:to-[#6476ED]"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.code}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex lg:flex-col gap-5 lg:gap-0 items-start"
              >
                <motion.div
                  whileHover={{ scale: 1.06 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  className="relative z-10 w-14 h-14 rounded-2xl border border-[#087D94]/45 dark:border-[#22D3D5]/55 bg-[#F6F9FC] dark:bg-[#152337] flex items-center justify-center font-display font-mono-tabular text-base font-bold text-[#087D94] dark:text-[#22D3D5] shrink-0 shadow-xs"
                >
                  {step.code}
                </motion.div>

                <div className="lg:mt-6 rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#152337] p-6 w-full h-full hover:border-[#087D94]/50 dark:hover:border-[#22D3D5]/50 transition-colors">
                  <h3 className="font-display text-xl font-bold text-[#102338] dark:text-[#F5FAFF]">
                    {step.code}. {step.title}
                  </h3>
                  <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-[#46596A] dark:text-[#B8C8D8]">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
