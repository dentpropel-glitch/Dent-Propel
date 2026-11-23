import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CalendarCheck,
  GitBranch,
  Megaphone,
  MessageSquareText,
  Sparkles,
} from 'lucide-react';

interface NetworkNode {
  id: string;
  label: string;
  cardTitle: string;
  sampleLine: string;
  sampleDetail: string;
  icon: React.ComponentType<{ className?: string }>;
  // Coordinates in 520x460 desktop SVG space
  x: number;
  y: number;
  cardPositionClass: string;
}

const NODES: NetworkNode[] = [
  {
    id: 'marketing',
    label: 'Marketing',
    cardTitle: 'Campaign Overview',
    sampleLine: 'Implant & Aligner Campaigns',
    sampleDetail: 'Local reach & educational reels active',
    icon: Megaphone,
    x: 112,
    y: 88,
    cardPositionClass: 'top-2 left-2',
  },
  {
    id: 'inquiries',
    label: 'Patient Inquiries',
    cardTitle: 'Inquiry Received',
    sampleLine: 'Orthodontic Consult Inquiry',
    sampleDetail: 'Captured via landing form · Source tagged',
    icon: MessageSquareText,
    x: 408,
    y: 94,
    cardPositionClass: 'top-4 right-2',
  },
  {
    id: 'lead-management',
    label: 'Lead Management',
    cardTitle: 'Pipeline Organized',
    sampleLine: 'Stage: Contacted',
    sampleDetail: 'Assigned to front-desk coordinator',
    icon: GitBranch,
    x: 96,
    y: 344,
    cardPositionClass: 'bottom-4 left-2',
  },
  {
    id: 'follow-up',
    label: 'Automated Follow-Up',
    cardTitle: 'Follow-Up Scheduled',
    sampleLine: '24h Reception Reminder',
    sampleDetail: 'Automated acknowledgment sent',
    icon: Sparkles,
    x: 268,
    y: 392,
    cardPositionClass: 'hidden',
  },
  {
    id: 'appointments',
    label: 'Appointments',
    cardTitle: 'Appointment Request',
    sampleLine: 'Thursday Consultation Slot',
    sampleDetail: 'Reception confirmation handoff ready',
    icon: CalendarCheck,
    x: 422,
    y: 332,
    cardPositionClass: 'bottom-4 right-2',
  },
];

const CENTER = { x: 260, y: 224 };

export function GrowthNetworkVisualization() {
  const [activeId, setActiveId] = useState<string>('inquiries');
  const activeNode = NODES.find((n) => n.id === activeId) || NODES[0];

  return (
    <div className="relative w-full">
      {/* Desktop & Tablet Interactive Connected Hub */}
      <div className="hidden sm:block relative rounded-3xl border border-[#DCE7EE] dark:border-[#304258] bg-white/85 dark:bg-[#101B2B]/85 backdrop-blur-xl p-6 shadow-[var(--dp-shadow)] overflow-hidden">
        {/* Subtle inner grid & glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(19,175,168,0.12),transparent_62%)] dark:bg-[radial-gradient(circle_at_50%_48%,rgba(34,211,213,0.14),transparent_62%)]"
        />

        {/* Top header line */}
        <div className="relative z-10 flex items-center justify-between gap-4 pb-3 border-b border-[#DCE7EE]/80 dark:border-[#304258]/80 text-xs">
          <span className="font-semibold tracking-wide text-[#102338] dark:text-[#F5FAFF]">
            Connected Growth Architecture
          </span>
          <span className="font-mono-tabular text-[#46596A] dark:text-[#B8C8D8]">
            Illustrative workflow sample
          </span>
        </div>

        {/* SVG Connection Canvas + Interactive Node Buttons */}
        <div className="relative h-[440px] w-full mt-2">
          <svg
            viewBox="0 0 520 440"
            className="w-full h-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="dpNetStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#087D94" />
                <stop offset="50%" stopColor="#22D3D5" />
                <stop offset="100%" stopColor="#6476ED" />
              </linearGradient>
            </defs>

            {/* Outer architectural orbit ring */}
            <circle
              cx={CENTER.x}
              cy={CENTER.y}
              r="142"
              fill="none"
              stroke="currentColor"
              className="text-[#DCE7EE] dark:text-[#304258]"
              strokeDasharray="4 6"
              strokeWidth="1"
            />

            {/* Connection lines from center to each node */}
            {NODES.map((node) => {
              const isSelected = node.id === activeId;
              const midX = (CENTER.x + node.x) / 2;
              const midY = (CENTER.y + node.y) / 2 - 14;
              const d = `M ${CENTER.x} ${CENTER.y} Q ${midX} ${midY} ${node.x} ${node.y}`;
              return (
                <g key={node.id}>
                  <path
                    d={d}
                    fill="none"
                    stroke="currentColor"
                    className="text-[#DCE7EE] dark:text-[#304258]"
                    strokeWidth={isSelected ? 2 : 1.25}
                  />
                  <path
                    d={d}
                    fill="none"
                    stroke="url(#dpNetStroke)"
                    strokeWidth={isSelected ? 2.5 : 1.2}
                    strokeOpacity={isSelected ? 1 : 0.4}
                    className={isSelected ? 'dp-flow-line' : ''}
                  />
                </g>
              );
            })}
          </svg>

          {/* Central Hub Node */}
          <div
            style={{
              left: `${(CENTER.x / 520) * 100}%`,
              top: `${(CENTER.y / 440) * 100}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="relative flex flex-col items-center justify-center w-32 h-32 rounded-full border border-[#087D94]/40 dark:border-[#22D3D5]/55 bg-white dark:bg-[#152337] shadow-[0_0_40px_rgba(34,211,213,0.18)] text-center px-3">
              <img
                src="/assets/aistudio/Glossy_Navy_DP_Logo_with_Teal_Swoosh_c7bac0b5.png"
                alt="Dent Propel central system hub"
                referrerPolicy="no-referrer"
                className="w-9 h-9 object-contain mb-1 rounded-lg bg-white p-0.5"
              />
              <span className="font-display text-xs font-bold tracking-tight text-[#102338] dark:text-[#F5FAFF]">
                DENT PROPEL
              </span>
              <span className="text-[11px] text-[#087D94] dark:text-[#22D3D5] font-medium">
                Core Hub
              </span>
            </div>
          </div>

          {/* 5 Interactive Process Nodes */}
          {NODES.map((node) => {
            const Icon = node.icon;
            const isSelected = node.id === activeId;
            return (
              <motion.button
                key={node.id}
                type="button"
                onClick={() => setActiveId(node.id)}
                onMouseEnter={() => setActiveId(node.id)}
                whileHover={{ y: -2 }}
                style={{
                  left: `${(node.x / 520) * 100}%`,
                  top: `${(node.y / 440) * 100}%`,
                }}
                aria-pressed={isSelected}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#087D94] dark:bg-[#1B2C42] text-white dark:text-[#22D3D5] border-[#087D94] dark:border-[#22D3D5] shadow-md'
                    : 'bg-white/95 dark:bg-[#152337]/95 text-[#102338] dark:text-[#F5FAFF] border-[#DCE7EE] dark:border-[#304258] hover:border-[#087D94]/60 dark:hover:border-[#22D3D5]/60 shadow-xs'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{node.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Active Node Sample Inspection Strip */}
        <div className="relative z-10 mt-2 rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#152337] p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-medium text-[#087D94] dark:text-[#22D3D5]">
              {activeNode.cardTitle} · {activeNode.label}
            </div>
            <div className="font-display text-sm sm:text-base font-semibold text-[#102338] dark:text-[#F5FAFF] truncate mt-0.5">
              {activeNode.sampleLine}
            </div>
            <div className="text-xs text-[#46596A] dark:text-[#B8C8D8] mt-0.5">
              {activeNode.sampleDetail}
            </div>
          </div>
          <span className="font-mono-tabular text-[11px] text-[#46596A] dark:text-[#B8C8D8] shrink-0">
            Sample Flow
          </span>
        </div>
      </div>

      {/* Mobile Vertical Connected Workflow Illustration */}
      <div className="sm:hidden rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-white/90 dark:bg-[#101B2B]/90 p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE7EE] dark:border-[#304258] text-xs">
          <span className="font-semibold text-[#102338] dark:text-[#F5FAFF]">
            Dent Propel Growth Network
          </span>
          <span className="font-mono-tabular text-[#46596A] dark:text-[#B8C8D8]">
            Illustrative sample
          </span>
        </div>

        <div className="space-y-2.5">
          {NODES.map((node, index) => {
            const Icon = node.icon;
            const isSelected = node.id === activeId;
            return (
              <div key={node.id} className="relative">
                <button
                  type="button"
                  onClick={() => setActiveId(node.id)}
                  aria-expanded={isSelected}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#087D94] dark:border-[#22D3D5] bg-[#EAF8FA]/60 dark:bg-[#1B2C42]'
                      : 'border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC]/60 dark:bg-[#152337]'
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-[#101B2B] border border-[#DCE7EE] dark:border-[#304258] text-[#087D94] dark:text-[#22D3D5] shrink-0">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold text-[#102338] dark:text-[#F5FAFF]">
                        0{index + 1}. {node.label}
                      </span>
                      <span className="text-[11px] font-mono-tabular text-[#087D94] dark:text-[#22D3D5]">
                        {node.cardTitle}
                      </span>
                    </span>
                    <span className="block text-xs text-[#46596A] dark:text-[#B8C8D8] mt-1">
                      {node.sampleLine} — {node.sampleDetail}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
