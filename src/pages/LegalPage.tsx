import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useFunnel } from '../context/FunnelContext';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'refund';
}

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    updated: 'Effective upon clinic onboarding',
    sections: [
      {
        heading: 'Business Information Collected',
        body: 'Dent Propel collects business contact and practice scoping information submitted voluntarily through our checkout and onboarding forms (such as doctor name, clinic name, business email, phone/WhatsApp number, city, and public website or social page URL). We do not request or collect patient medical records during website checkout.',
      },
      {
        heading: 'How Practice Data Is Used',
        body: 'Submitted clinic information is used exclusively to prepare service agreements, verify transactions when payment gateways are configured, coordinate onboarding discovery, and connect agreed clinic automation workflows.',
      },
      {
        heading: 'Payment & Security Boundaries',
        body: 'Payment card information is never stored or collected in Dent Propel custom frontend forms. All live payment transactions are handled directly through authorized hosted payment providers with server-side verification.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    updated: 'Standard Practice Agreement Overview',
    sections: [
      {
        heading: 'Scope of Growth System Services',
        body: 'Dent Propel provides dental practice marketing, inquiry capture workflow setup, AI-assisted follow-up support, and performance reporting strictly according to the deliverables confirmed in your selected package and written practice agreement.',
      },
      {
        heading: 'Advertising Spend & Third-Party Platforms',
        body: 'Paid advertising budgets (such as Meta Ads) and optional third-party software subscriptions are billed directly by those platforms to your clinic and are separate from Dent Propel management fees.',
      },
      {
        heading: 'No Guaranteed Clinical or Financial Outcomes',
        body: 'Marketing performance and patient booking rates depend on local market conditions, clinic capacity, treatment mix, and front-desk responsiveness. Dent Propel makes no fabricated guarantees regarding patient volume or revenue.',
      },
    ],
  },
  refund: {
    title: 'Refund and Cancellation Policy',
    updated: 'Transparent Billing Governance',
    sections: [
      {
        heading: 'Setup & Implementation Fees',
        body: 'Initial setup and implementation work begins following clinic discovery and payment verification. Any applicable refund eligibility prior to asset configuration is specified in your written service agreement.',
      },
      {
        heading: 'Recurring Management Cycles',
        body: 'Recurring management services may be canceled in accordance with the written notice period specified in your active billing schedule prior to the next renewal cycle.',
      },
      {
        heading: 'Preview Mode Orders',
        body: 'Submissions completed while the platform is operating in non-transactional Preview Mode involve zero financial charges and carry no payment obligation.',
      },
    ],
  },
};

export function LegalPage({ type }: LegalPageProps) {
  const { navigate } = useFunnel();
  const doc = CONTENT[type];

  return (
    <main className="py-14 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#46596A] dark:text-[#B8C8D8] hover:text-[#087D94] dark:hover:text-[#22D3D5] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Dent Propel</span>
        </button>

        <article className="rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-7 sm:p-10 space-y-6">
          <div className="pb-5 border-b border-[#DCE7EE] dark:border-[#304258]">
            <p className="text-xs font-mono-tabular uppercase tracking-wider text-[#087D94] dark:text-[#22D3D5]">
              {doc.updated}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#102338] dark:text-[#F5FAFF] mt-2">
              {doc.title}
            </h1>
          </div>

          <div className="space-y-6">
            {doc.sections.map((sec) => (
              <section key={sec.heading} className="space-y-2">
                <h2 className="font-display text-xl font-bold text-[#102338] dark:text-[#F5FAFF]">
                  {sec.heading}
                </h2>
                <p className="text-base leading-relaxed text-[#46596A] dark:text-[#B8C8D8]">
                  {sec.body}
                </p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}
