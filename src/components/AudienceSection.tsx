import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { KineticReveal, MotionTiltCard, ScrollFeatureCard } from './MotionPrimitives';

interface AudienceProfile {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

const AUDIENCES: AudienceProfile[] = [
  {
    title: 'Independent Dental Clinics',
    description:
      'For practices seeking professional marketing and more organized inquiry management.',
    imageSrc: '/src/assets/images/clinic_independent_studio_1795421183028.jpg',
    imageAlt: 'Modern independent dental clinic consultation suite',
  },
  {
    title: 'Established Dental Practices',
    description:
      'For clinics ready to coordinate campaigns, follow-up, and marketing performance more effectively.',
    imageSrc: '/src/assets/images/clinic_established_practice_1795421181459.jpg',
    imageAlt: 'Established dental practice reception lounge and front-desk team',
  },
  {
    title: 'Multi-Dentist Practices',
    description:
      'For growing practices that need clearer processes across multiple staff members and inquiry channels.',
    imageSrc: '/src/assets/images/clinic_multidentist_group_1795421182740.jpg',
    imageAlt: 'Multi-dentist practice directors reviewing growth workflow analytics',
  },
];

function AudienceImage({ src, alt, title }: { src: string; alt: string; title: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#EAF8FA] to-[#DCE7EE] dark:from-[#152337] dark:to-[#101B2B] p-6 text-center">
        <Building2 className="w-8 h-8 text-[#087D94] dark:text-[#22D3D5] mb-2" aria-hidden="true" />
        <span className="text-xs font-medium text-[#46596A] dark:text-[#B8C8D8]">{title}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
    />
  );
}

const PROCESS_STEPS = [
  { code: '01', title: 'Discover', note: 'Practice goals & current lead channels' },
  { code: '02', title: 'Strategize', note: 'Tailored campaigns, capture & follow-up' },
  { code: '03', title: 'Implement', note: 'Configure creatives, forms & automations' },
  { code: '04', title: 'Optimize', note: 'Track inquiries & refine booking flow' },
];

export function AudienceSection() {
  return (
    <section
      id="how-it-works"
      className="py-14 lg:py-20 bg-white dark:bg-[#101B2B] border-y border-[#DCE7EE] dark:border-[#304258] scroll-mt-20"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-12">
        <div>
          <KineticReveal className="max-w-2xl mb-8">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase text-[#087D94] dark:text-[#22D3D5] mb-2">
              Practice Fit & Process
            </p>
            <h2 className="font-display text-2xl sm:text-4xl lg:text-[40px] leading-[1.15] font-bold tracking-tight text-[#102338] dark:text-[#F5FAFF] text-balance">
              Built for Dentists Ready for a Structured Workflow.
            </h2>
          </KineticReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {AUDIENCES.map((item, idx) => (
              <ScrollFeatureCard
                key={item.title}
                index={idx}
                stepDelay={0.095}
                direction="up"
                distance={30}
              >
                <MotionTiltCard
                  intensity={3.5}
                  className="group h-full rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#152337] shadow-xs hover:border-[#087D94]/60 dark:hover:border-[#22D3D5]/60 transition-colors"
                >
                  <article className="relative z-10 h-full flex flex-col">
                    <div className="aspect-[16/10] w-full overflow-hidden bg-[#EAF8FA] dark:bg-[#101B2B]">
                      <AudienceImage src={item.imageSrc} alt={item.imageAlt} title={item.title} />
                    </div>
                    <div className="p-5 sm:p-6 flex-1 flex flex-col">
                      <h3 className="font-display text-lg sm:text-xl font-bold text-[#102338] dark:text-[#F5FAFF]">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#46596A] dark:text-[#B8C8D8]">
                        {item.description}
                      </p>
                    </div>
                  </article>
                </MotionTiltCard>
              </ScrollFeatureCard>
            ))}
          </div>
        </div>

        {/* Sleek 4-Step Execution Strip */}
        <div className="pt-8 border-t border-[#DCE7EE] dark:border-[#304258]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROCESS_STEPS.map((step, idx) => (
              <ScrollFeatureCard
                key={step.code}
                index={idx}
                stepDelay={0.075}
                direction="up"
                distance={22}
                className="h-full"
              >
                <div className="h-full rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#152337] p-4 sm:p-5 flex items-start gap-3.5 hover:border-[#087D94]/50 dark:hover:border-[#22D3D5]/50 transition-colors">
                  <span className="font-mono-tabular text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#101B2B] border border-[#DCE7EE] dark:border-[#304258] text-[#087D94] dark:text-[#22D3D5] shrink-0">
                    {step.code}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-[#102338] dark:text-[#F5FAFF]">
                      {step.title}
                    </h3>
                    <p className="mt-0.5 text-xs sm:text-sm text-[#46596A] dark:text-[#B8C8D8]">
                      {step.note}
                    </p>
                  </div>
                </div>
              </ScrollFeatureCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

