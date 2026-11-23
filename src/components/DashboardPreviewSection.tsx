import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  CalendarClock,
  Layers,
  Megaphone,
  Users,
} from 'lucide-react';

type DashboardTab = 'overview' | 'marketing' | 'leads' | 'followups' | 'appointments';

const TABS: {
  id: DashboardTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'followups', label: 'Follow-Ups', icon: Activity },
  { id: 'appointments', label: 'Appointments', icon: CalendarClock },
];

const SAMPLE_LEADS = [
  {
    name: 'Sample Inquiry #104',
    service: 'Dental Implants Consultation',
    source: 'Meta Local Campaign',
    stage: 'Appointment Requested',
  },
  {
    name: 'Sample Inquiry #103',
    service: 'Clear Aligner Assessment',
    source: 'Instagram Reels Funnel',
    stage: 'Follow-Up Pending',
  },
  {
    name: 'Sample Inquiry #102',
    service: 'Root Canal & Crown Inquiry',
    source: 'Website Inquiry Form',
    stage: 'Contacted',
  },
  {
    name: 'Sample Inquiry #101',
    service: 'Smile Makeover Consultation',
    source: 'Meta Local Campaign',
    stage: 'New Inquiry',
  },
  {
    name: 'Sample Inquiry #100',
    service: 'Routine Hygiene Checkup',
    source: 'Google Search Profile',
    stage: 'Closed',
  },
];

export function DashboardPreviewSection() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-[#101B2B] border-y border-[#DCE7EE] dark:border-[#304258]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase text-[#087D94] dark:text-[#22D3D5] mb-3">
              Interactive Workflow Illustration
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[46px] leading-[1.15] font-bold tracking-tight text-[#102338] dark:text-[#F5FAFF] text-balance">
              See How a Connected Dental Growth Workflow Can Operate.
            </h2>
          </div>
          <p className="text-xs font-mono-tabular text-[#46596A] dark:text-[#B8C8D8] shrink-0">
            Conceptual Illustration · All sample figures are illustrative
          </p>
        </div>

        {/* Console Shell */}
        <div className="rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#080E1D] p-4 sm:p-7 shadow-[var(--dp-shadow)]">
          {/* Tab Bar */}
          <div
            role="tablist"
            aria-label="Workflow demonstration views"
            className="flex flex-wrap items-center gap-2 pb-5 border-b border-[#DCE7EE] dark:border-[#304258]"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                    selected
                      ? 'text-white dark:text-[#080E1D] border-transparent'
                      : 'bg-white dark:bg-[#152337] text-[#46596A] dark:text-[#B8C8D8] border-[#DCE7EE] dark:border-[#304258] hover:text-[#102338] dark:hover:text-[#F5FAFF]'
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="dashboardActiveTabBg"
                      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                      className="absolute inset-0 rounded-xl bg-[#087D94] dark:bg-[#22D3D5]"
                    />
                  )}
                  <Icon className="relative z-10 w-4 h-4" aria-hidden="true" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Panels */}
          <div className="pt-6" role="tabpanel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Active Campaigns (Sample)', value: '04', detail: 'Implant & Ortho focus' },
                    { label: 'Captured Inquiries (Sample)', value: '38', detail: 'Forms · Social · WhatsApp' },
                    { label: 'Follow-Up Workflows (Sample)', value: '38', detail: 'Acknowledged & queued' },
                    { label: 'Appointment Requests (Sample)', value: '14', detail: 'Pending reception confirm' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-5"
                    >
                      <div className="text-xs font-medium text-[#46596A] dark:text-[#B8C8D8]">
                        {stat.label}
                      </div>
                      <div className="mt-2 font-display font-mono-tabular text-3xl font-bold text-[#102338] dark:text-[#F5FAFF]">
                        {stat.value}
                      </div>
                      <div className="mt-1 text-xs text-[#087D94] dark:text-[#22D3D5]">
                        {stat.detail}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-5">
                  <div className="text-sm font-semibold text-[#102338] dark:text-[#F5FAFF] mb-3">
                    End-to-End Sample Flow Architecture
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                    {[
                      '1. Local Ad & Reel Engagement',
                      '2. Dedicated Clinic Inquiry Form',
                      '3. Instant Staff Alert & Reply',
                      '4. Reception Booking Handoff',
                    ].map((step) => (
                      <div
                        key={step}
                        className="rounded-xl bg-[#F6F9FC] dark:bg-[#101B2B] border border-[#DCE7EE] dark:border-[#304258] p-3.5 font-medium text-[#102338] dark:text-[#F5FAFF]"
                      >
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'marketing' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    channel: 'Meta Paid Campaigns',
                    category: 'Implant & Restorative Inquiries',
                    attribution: 'UTM Campaign Tagging Active',
                  },
                  {
                    channel: 'Instagram & Facebook Content',
                    category: 'Doctor Authority & Educational Reels',
                    attribution: 'Profile Link Funnel Attribution',
                  },
                  {
                    channel: 'Landing Page Funnels',
                    category: 'Treatment-Focused Inquiry Capture',
                    attribution: 'Direct Form Source Logging',
                  },
                ].map((item) => (
                  <div
                    key={item.channel}
                    className="rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-5 space-y-2"
                  >
                    <div className="text-xs font-mono-tabular text-[#087D94] dark:text-[#22D3D5]">
                      Illustrative Category
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#102338] dark:text-[#F5FAFF]">
                      {item.channel}
                    </h3>
                    <p className="text-sm text-[#46596A] dark:text-[#B8C8D8]">
                      {item.category}
                    </p>
                    <div className="pt-2 text-xs font-medium text-[#102338] dark:text-[#F5FAFF]">
                      {item.attribution}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#101B2B] text-xs uppercase tracking-wider text-[#46596A] dark:text-[#B8C8D8]">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">Illustrative Record</th>
                        <th className="py-3.5 px-4 font-semibold">Treatment Interest</th>
                        <th className="py-3.5 px-4 font-semibold">Source</th>
                        <th className="py-3.5 px-4 font-semibold">Pipeline Stage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCE7EE] dark:divide-[#304258]">
                      {SAMPLE_LEADS.map((lead) => (
                        <tr key={lead.name}>
                          <td className="py-3.5 px-4 font-mono-tabular font-medium text-[#102338] dark:text-[#F5FAFF]">
                            {lead.name}
                          </td>
                          <td className="py-3.5 px-4 text-[#46596A] dark:text-[#B8C8D8]">
                            {lead.service}
                          </td>
                          <td className="py-3.5 px-4 text-[#46596A] dark:text-[#B8C8D8]">
                            {lead.source}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-[#087D94] dark:text-[#22D3D5]">
                            {lead.stage}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'followups' && (
              <div className="space-y-3">
                {[
                  {
                    time: 'T + 0 min (Illustrative)',
                    action: 'Inquiry Logged & Acknowledged',
                    detail: 'Automated confirmation message sent; inquiry tagged by treatment category.',
                  },
                  {
                    time: 'T + 2 min (Illustrative)',
                    action: 'Front Desk Notification Dispatched',
                    detail: 'Reception coordinator receives lead summary with source and preferred slot.',
                  },
                  {
                    time: 'T + 24 hrs (Illustrative)',
                    action: 'Unbooked Follow-Up Reminder',
                    detail: 'If status remains Contacted, workflow triggers a gentle follow-up nudge.',
                  },
                ].map((event) => (
                  <div
                    key={event.time}
                    className="rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-mono-tabular text-xs text-[#087D94] dark:text-[#22D3D5]">
                        {event.time}
                      </div>
                      <div className="font-display text-base font-bold text-[#102338] dark:text-[#F5FAFF] mt-0.5">
                        {event.action}
                      </div>
                      <div className="text-sm text-[#46596A] dark:text-[#B8C8D8] mt-1">
                        {event.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    slot: 'Morning Slot · Illustrative',
                    status: 'Awaiting Reception Call',
                    note: 'Prospective implant inquiry requested 11:00 AM availability.',
                  },
                  {
                    slot: 'Afternoon Slot · Illustrative',
                    status: 'Confirmation Sent',
                    note: 'Clinic location details and pre-visit checklist dispatched.',
                  },
                  {
                    slot: 'Reschedule Queue · Illustrative',
                    status: 'Follow-Up Active',
                    note: 'Coordinator alerted to offer alternate consultation timing.',
                  },
                ].map((appt) => (
                  <div
                    key={appt.slot}
                    className="rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#152337] p-5 space-y-2"
                  >
                    <div className="font-mono-tabular text-xs text-[#087D94] dark:text-[#22D3D5]">
                      {appt.slot}
                    </div>
                    <div className="font-display text-lg font-bold text-[#102338] dark:text-[#F5FAFF]">
                      {appt.status}
                    </div>
                    <p className="text-sm text-[#46596A] dark:text-[#B8C8D8]">
                      {appt.note}
                    </p>
                  </div>
                ))}
              </div>
            )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
