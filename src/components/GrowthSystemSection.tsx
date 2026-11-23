import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BarChart2,
  CalendarCheck2,
  Inbox,
  Megaphone,
  Workflow,
} from 'lucide-react';
import { KineticReveal, ScrollFeatureCard } from './MotionPrimitives';
import { PipelineStage3D } from './three/PipelineStage3D';

interface SystemStage {
  id: string;
  code: string;
  title: string;
  summary: string;
  operationalFocus: string;
  outputs: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: SystemStage[] = [
  {
    id: 'attract',
    code: '01',
    title: 'ATTRACT',
    summary: 'Reach relevant audiences through social media content and targeted marketing.',
    operationalFocus:
      'Align educational clinic content and paid local campaigns around priority dental treatments.',
    outputs: [
      'Structured social content calendar',
      'Targeted Meta local campaign structure',
      'Treatment-specific landing entry points',
    ],
    icon: Megaphone,
  },
  {
    id: 'capture',
    code: '02',
    title: 'CAPTURE',
    summary:
      'Make inquiries easier to collect through forms, landing pages, and integrated communication channels.',
    operationalFocus:
      'Route website forms, social inquiries, and WhatsApp touchpoints into one organized intake stream.',
    outputs: [
      'Conversion-focused inquiry capture',
      'Source & campaign attribution tags',
      'Centralized lead entry logging',
    ],
    icon: Inbox,
  },
  {
    id: 'follow-up',
    code: '03',
    title: 'FOLLOW UP',
    summary:
      'Organize lead records and support timely replies using automation and staff notifications.',
    operationalFocus:
      'Ensure prospective patient inquiries receive prompt acknowledgment while alerting reception teams.',
    outputs: [
      'Automated initial acknowledgment',
      'Reception & coordinator alerts',
      'Structured follow-up reminder sequences',
    ],
    icon: Workflow,
  },
  {
    id: 'book',
    code: '04',
    title: 'BOOK',
    summary: 'Help reception teams coordinate appointment requests and confirmations.',
    operationalFocus:
      'Give front-desk staff clear context on each inquiry so consultation scheduling is smoother.',
    outputs: [
      'Reception handoff visibility',
      'Appointment request status tracking',
      'Pre-visit reminder coordination',
    ],
    icon: CalendarCheck2,
  },
  {
    id: 'optimize',
    code: '05',
    title: 'OPTIMIZE',
    summary:
      'Review lead sources, inquiry activity, campaign performance, and booking-related metrics.',
    operationalFocus:
      'Close the feedback loop between campaigns, inquiry handling, and clinic scheduling outcomes.',
    outputs: [
      'Channel-level inquiry visibility',
      'Follow-up cadence review',
      'Ongoing campaign refinement',
    ],
    icon: BarChart2,
  },
];

export function GrowthSystemSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const current = STAGES[selectedIndex];
  const ActiveIcon = current.icon;

  return (
    <section id="the-system" className="py-16 lg:py-22 bg-white dark:bg-[#101B2B] border-y border-[#DCE7EE] dark:border-[#304258] scroll-mt-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <KineticReveal className="max-w-3xl mb-10 lg:mb-12">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase text-[#087D94] dark:text-[#22D3D5] mb-3">
            The Connected System
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] leading-[1.12] font-bold tracking-tight text-[#102338] dark:text-[#F5FAFF] text-balance">
            One Connected Growth System. Built Around Your Dental Practice.
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#46596A] dark:text-[#B8C8D8] max-w-[62ch]">
            From helping patients discover your clinic to coordinating inquiries and follow-ups,
            Dent Propel brings key growth activities into a structured process.
          </p>
        </KineticReveal>

        {/* Interactive 3D Pipeline Sculpture synchronized with stage buttons */}
        <ScrollFeatureCard direction="scale" distance={22} large>
          <PipelineStage3D
            selectedIndex={selectedIndex}
            onSelectStage={setSelectedIndex}
          />
        </ScrollFeatureCard>

        {/* Desktop Interactive Connected Stage Selector */}
        <div className="hidden lg:block mb-7">
          <div className="relative grid grid-cols-5 gap-4">
            {/* Connector Line Behind Nodes */}
            <div
              aria-hidden="true"
              className="absolute top-7 left-[10%] right-[10%] h-[2px] bg-[#DCE7EE] dark:bg-[#304258]"
            >
              <div
                className="h-full bg-gradient-to-r from-[#087D94] to-[#13AFA8] dark:from-[#22D3D5] dark:to-[#6476ED] transition-all duration-300"
                style={{ width: `${(selectedIndex / (STAGES.length - 1)) * 100}%` }}
              />
            </div>

            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = idx === selectedIndex;
              const isPastOrActive = idx <= selectedIndex;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  aria-pressed={isActive}
                  className="relative z-10 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
                >
                  <span
                    className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-[#087D94] dark:bg-gradient-to-br dark:from-[#22D3D5] dark:to-[#43B5EC] text-white dark:text-[#080E1D] border-[#087D94] dark:border-[#22D3D5] shadow-md scale-105'
                        : isPastOrActive
                          ? 'bg-[#EAF8FA] dark:bg-[#1B2C42] text-[#087D94] dark:text-[#22D3D5] border-[#087D94]/40 dark:border-[#22D3D5]/40'
                          : 'bg-[#F6F9FC] dark:bg-[#152337] text-[#46596A] dark:text-[#B8C8D8] border-[#DCE7EE] dark:border-[#304258] group-hover:border-[#087D94]/50 dark:group-hover:border-[#22D3D5]/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="mt-3 font-mono-tabular text-xs font-medium text-[#087D94] dark:text-[#22D3D5]">
                    {stage.code}
                  </span>
                  <span
                    className={`mt-0.5 font-display text-sm font-bold tracking-tight ${
                      isActive
                        ? 'text-[#102338] dark:text-[#F5FAFF]'
                        : 'text-[#46596A] dark:text-[#B8C8D8]'
                    }`}
                  >
                    {stage.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile / Tablet Stage Buttons */}
        <div className="lg:hidden flex flex-wrap gap-2 mb-5" role="tablist" aria-label="Growth system stages">
          {STAGES.map((stage, idx) => {
            const isActive = idx === selectedIndex;
            return (
              <button
                key={stage.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#087D94] dark:bg-[#22D3D5] text-white dark:text-[#080E1D] border-[#087D94] dark:border-[#22D3D5]'
                    : 'bg-[#F6F9FC] dark:bg-[#152337] text-[#46596A] dark:text-[#B8C8D8] border-[#DCE7EE] dark:border-[#304258]'
                }`}
              >
                {stage.code} — {stage.title}
              </button>
            );
          })}
        </div>

        {/* Dynamic Adjacent Stage Inspection Card with Scroll Reveal & AnimatePresence */}
        <ScrollFeatureCard direction="up" distance={26} baseDelay={0.06}>
          <div className="rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#152337] p-5 sm:p-8 shadow-[var(--dp-shadow)] overflow-hidden">
            <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#087D94] dark:text-[#22D3D5]">
                  <ActiveIcon className="w-4 h-4" aria-hidden="true" />
                  <span>
                    Stage {current.code} · {current.title}
                  </span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#102338] dark:text-[#F5FAFF]">
                  {current.summary}
                </h3>

                <p className="text-sm sm:text-base leading-relaxed text-[#46596A] dark:text-[#B8C8D8]">
                  {current.operationalFocus}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndex((prev) => (prev + 1) % STAGES.length)
                  }
                  className="inline-flex items-center gap-2 pt-1 text-sm font-semibold text-[#087D94] dark:text-[#22D3D5] hover:underline cursor-pointer"
                >
                  <span>Next stage: {STAGES[(selectedIndex + 1) % STAGES.length].title}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="lg:col-span-5 rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#101B2B] p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#46596A] dark:text-[#B8C8D8] mb-3">
                  Key Deliverables
                </div>
                <ul className="space-y-2.5">
                  {current.outputs.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                      className="flex items-start gap-2.5 text-sm font-medium text-[#102338] dark:text-[#F5FAFF]"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#087D94] dark:bg-[#22D3D5] shrink-0"
                      />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
          </div>
        </ScrollFeatureCard>
      </div>
    </section>
  );
}
