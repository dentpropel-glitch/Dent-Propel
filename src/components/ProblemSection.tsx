import React from 'react';
import { BarChart3, Clock, Layers, MessageSquareOff } from 'lucide-react';
import { motion } from 'motion/react';
import { MotionTiltCard } from './MotionPrimitives';

const PROBLEMS = [
  {
    number: '01',
    title: 'Inconsistent Patient Inquiries',
    description:
      'Social media activity alone doesn’t guarantee a consistent flow of relevant patient inquiries.',
    icon: MessageSquareOff,
  },
  {
    number: '02',
    title: 'Missed Follow-Up Opportunities',
    description:
      'When inquiries aren’t tracked and handled consistently, potential appointment opportunities can be missed.',
    icon: Clock,
  },
  {
    number: '03',
    title: 'Disconnected Marketing Tools',
    description:
      'Ads, social media, WhatsApp, and booking records often operate independently.',
    icon: Layers,
  },
  {
    number: '04',
    title: 'Unclear Marketing Performance',
    description:
      'Without connected reporting, it can be difficult to understand how marketing activity contributes to booked appointments.',
    icon: BarChart3,
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-[#101B2B] border-y border-[#DCE7EE] dark:border-[#304258]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mb-12 lg:mb-16">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase text-[#087D94] dark:text-[#22D3D5] mb-3">
            The Core Challenge
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[46px] leading-[1.15] font-bold tracking-tight text-[#102338] dark:text-[#F5FAFF] text-balance">
            Your Clinic Doesn’t Need More Random Marketing. It Needs a System.
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#46596A] dark:text-[#B8C8D8] max-w-[62ch]">
            Marketing alone is only one part of practice growth. The real challenge is connecting
            visibility, patient inquiries, follow-up, and appointments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROBLEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.42, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                <MotionTiltCard
                  intensity={4}
                  className="group h-full rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#152337] p-7 hover:border-[#087D94]/60 dark:hover:border-[#22D3D5]/60 transition-colors"
                >
                  <article className="relative z-10">
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-[#1B2C42] border border-[#DCE7EE] dark:border-[#304258] text-[#087D94] dark:text-[#22D3D5] group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <span className="font-mono-tabular text-xs font-medium text-[#46596A] dark:text-[#B8C8D8]">
                        {item.number}
                      </span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#102338] dark:text-[#F5FAFF]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-[#46596A] dark:text-[#B8C8D8]">
                      {item.description}
                    </p>
                  </article>
                </MotionTiltCard>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-[#DCE7EE] dark:border-[#304258] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="font-display text-lg sm:text-xl font-semibold text-[#102338] dark:text-[#F5FAFF]">
            More activity isn’t the answer. A better-connected process is.
          </p>
          <a
            href="#the-system"
            className="text-sm font-semibold text-[#087D94] dark:text-[#22D3D5] hover:underline whitespace-nowrap shrink-0"
          >
            Explore the connected workflow ↓
          </a>
        </div>
      </div>
    </section>
  );
}
