import type { OfferAddon, OfferDeliverable, PublicBusinessConfig } from '../lib/funnelLogic';

export const DEFAULT_DELIVERABLES: OfferDeliverable[] = [
  {
    id: 'social-strategy',
    group: 'Growth & Marketing',
    label: 'Social Media Strategy',
    description: 'Editorial positioning, treatment-education pillars, and monthly content planning tailored to your clinic.',
    includedByDefault: true,
    configurable: false,
  },
  {
    id: 'social-management',
    group: 'Growth & Marketing',
    label: 'Social Media Management',
    description: 'Dental-focused creatives, educational reels, brand consistency, and scheduled publishing.',
    includedByDefault: true,
    configurable: true,
  },
  {
    id: 'digital-marketing',
    group: 'Growth & Marketing',
    label: 'Digital Marketing & Funnel Pages',
    description: 'Conversion-focused local landing experiences aligned with priority dental services.',
    includedByDefault: true,
    configurable: true,
  },
  {
    id: 'paid-campaigns',
    group: 'Growth & Marketing',
    label: 'Paid Campaign Management',
    description: 'Meta campaign setup, local audience targeting, creative testing, and ongoing optimization.',
    includedByDefault: true,
    configurable: true,
  },
  {
    id: 'lead-capture',
    group: 'Lead & Automation',
    label: 'Lead Capture Workflows',
    description: 'Structured inquiry forms, WhatsApp entry routing, and source attribution tracking.',
    includedByDefault: true,
    configurable: false,
  },
  {
    id: 'lead-management',
    group: 'Lead & Automation',
    label: 'Lead Management Pipeline',
    description: 'Centralized inquiry tracking across stages from new inquiry through appointment request.',
    includedByDefault: true,
    configurable: false,
  },
  {
    id: 'ai-automation',
    group: 'Lead & Automation',
    label: 'AI Automation & Follow-Up Workflows',
    description: 'Automated acknowledgment, reminder sequences, and instant staff notifications.',
    includedByDefault: true,
    configurable: true,
  },
  {
    id: 'appointment-support',
    group: 'Lead & Automation',
    label: 'Appointment Follow-Up Support',
    description: 'Structured reception handoff workflows to help coordinate consultation requests.',
    includedByDefault: true,
    configurable: true,
  },
  {
    id: 'performance-reporting',
    group: 'Visibility & Reporting',
    label: 'Performance Reporting',
    description: 'Consolidated reviews of campaign activity, inquiry sources, and follow-up indicators.',
    includedByDefault: true,
    configurable: false,
  },
];

export const DEFAULT_ADDONS: OfferAddon[] = [
  {
    id: 'multi-branch-routing',
    label: 'Multi-Branch Inquiry Routing',
    description: 'Dedicated inquiry routing and source tagging across multiple clinic locations.',
    setupFeeDelta: null,
    monthlyFeeDelta: null,
  },
  {
    id: 'custom-whatsapp-crm-sync',
    label: 'Custom Practice Software / Sheet Sync',
    description: 'Bespoke n8n workflow bridge connecting inquiry records to your clinic’s existing spreadsheet or CRM.',
    setupFeeDelta: null,
    monthlyFeeDelta: null,
  },
];

export const FALLBACK_PUBLIC_CONFIG: PublicBusinessConfig = {
  brandName: 'Dent Propel',
  tagline: 'Driving Dental Growth.',
  market: 'Pakistan & International Dental Practices',
  offerName: 'Dent Propel Growth System',
  pricing: {
    isPricingConfigured: false,
    currency: 'PKR',
    billingInterval: 'monthly',
    setupFee: null,
    monthlyFee: null,
    taxRatePercent: 0,
    paidAdSpendNote:
      'Paid advertising budgets (such as Meta Ads spend) are paid directly by your clinic to the ad platform and are strictly separate from Dent Propel agency management fees.',
    thirdPartySoftwareNote:
      'Any optional third-party software subscriptions (such as WhatsApp Business API or dedicated CRM licenses) are billed directly by the respective providers if required.',
    cancellationTerms:
      'Service scope, billing cycle, and cancellation notice periods are confirmed in your written practice agreement prior to activation.',
  },
  paymentProviderConfigured: false,
  paymentProviderName: null,
  deliverables: DEFAULT_DELIVERABLES,
  addons: DEFAULT_ADDONS,
  contact: {
    email: null,
    whatsapp: '03060069993',
  },
  social: {
    facebook: null,
    instagram: null,
    linkedin: null,
  },
  bookingCalendarUrl: null,
};
