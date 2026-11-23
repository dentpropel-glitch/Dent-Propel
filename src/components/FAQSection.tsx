import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { KineticReveal, ScrollFeatureCard } from './MotionPrimitives';

const FAQS = [
  {
    q: 'What makes Dent Propel different from a traditional social media agency?',
    a: 'Traditional agencies stop at isolated posts or ads. Dent Propel connects social media, paid campaigns, inquiry capture, automated follow-up, and reception handoff into one structured clinic system.',
  },
  {
    q: 'Is advertising spend included in management fees?',
    a: 'No. Paid advertising budgets (such as Meta Ads) are paid directly by your clinic to the ad platform, separate from Dent Propel agency fees so you retain full billing control.',
  },
  {
    q: 'Will AI automation replace my receptionist?',
    a: 'No. Automation handles instant initial replies, inquiry logging, and reminders so your reception team can focus on assisting prospective patients and confirming bookings.',
  },
  {
    q: 'Can Dent Propel work with an independent clinic or existing tools?',
    a: 'Yes. We configure workflows for single-location and multi-dentist clinics alike and connect inquiry forms cleanly to spreadsheets, WhatsApp routing, or your CRM.',
  },
  {
    q: 'How do I get started?',
    a: 'You can submit the clinic application form online or message us directly on WhatsApp (0306-0069993) to confirm scope and schedule Clinic Discovery.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faqs"
      className="py-12 lg:py-16 bg-white dark:bg-[#101B2B] border-t border-[#DCE7EE] dark:border-[#304258] scroll-mt-20"
    >
      <div className="max-w-[920px] mx-auto px-4 sm:px-6">
        <KineticReveal className="text-center mb-8 lg:mb-10">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase text-[#087D94] dark:text-[#22D3D5] mb-2">
            FAQs
          </p>
          <h2 className="font-display text-2xl sm:text-4xl leading-[1.15] font-bold tracking-tight text-[#102338] dark:text-[#F5FAFF] text-balance">
            Common Questions.
          </h2>
        </KineticReveal>

        <div className="space-y-2.5">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <ScrollFeatureCard
                key={item.q}
                index={idx}
                stepDelay={0.06}
                direction="up"
                distance={20}
              >
                <div className="rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#152337] overflow-hidden transition-colors hover:border-[#087D94]/45 dark:hover:border-[#22D3D5]/45">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#087D94] dark:focus-visible:ring-[#22D3D5]"
                  >
                    <span className="font-display text-base font-semibold text-[#102338] dark:text-[#F5FAFF]">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#087D94] dark:text-[#22D3D5] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 pt-1 text-sm leading-relaxed text-[#46596A] dark:text-[#B8C8D8] border-t border-[#DCE7EE]/60 dark:border-[#304258]/60">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollFeatureCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

