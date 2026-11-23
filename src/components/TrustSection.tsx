import React from 'react';
import { Eye, GitMerge, ShieldCheck, Stethoscope } from 'lucide-react';

const PILLARS = [
  {
    title: 'Dental-Focused Approach',
    description:
      'Marketing and workflow planning designed around dental practice operations.',
    icon: Stethoscope,
  },
  {
    title: 'Connected Systems',
    description:
      'A structured approach rather than unrelated services.',
    icon: GitMerge,
  },
  {
    title: 'Practical Automation',
    description:
      'Automation designed to support human staff rather than replace professional judgment.',
    icon: ShieldCheck,
  },
  {
    title: 'Clearer Visibility',
    description:
      'Reporting that helps clinics understand important stages of the marketing and booking journey.',
    icon: Eye,
  },
];

export function TrustSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase text-[#087D94] dark:text-[#22D3D5]">
              Why Dent Propel
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] leading-[1.15] font-bold tracking-tight text-[#102338] dark:text-[#F5FAFF] text-balance">
              A Growth Partner Focused on the Whole Process.
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-[#46596A] dark:text-[#B8C8D8]">
              We don’t just manage your social media. We connect your marketing, inquiries, and
              follow-up processes into one structured growth system.
            </p>
            <div className="rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-5 text-sm text-[#46596A] dark:text-[#B8C8D8] leading-relaxed">
              Every engagement is built on transparent scope, documented workflow ownership, and
              clear separation between agency management fees and paid advertising spend.
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.title}
                  className="rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-6 sm:p-7 hover:border-[#087D94]/60 dark:hover:border-[#22D3D5]/60 transition-colors"
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#EAF8FA] dark:bg-[#1B2C42] text-[#087D94] dark:text-[#22D3D5] mb-4">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#102338] dark:text-[#F5FAFF]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2.5 text-base leading-relaxed text-[#46596A] dark:text-[#B8C8D8]">
                    {pillar.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
