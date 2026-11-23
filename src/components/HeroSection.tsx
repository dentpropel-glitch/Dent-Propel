import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useFunnel } from '../context/FunnelContext';
import { buildWhatsAppRedirectUrl } from '../lib/funnelLogic';
import { AmbientBackground } from './AmbientBackground';
import { HeroGrowth3D } from './three/HeroGrowth3D';

export function HeroSection() {
  const { config, navigate } = useFunnel();
  const whatsappUrl = buildWhatsAppRedirectUrl(
    config.contact.whatsapp,
    'Hello Dent Propel, I would like to learn about the Dental Practice Growth System for my clinic.',
  );

  return (
    <section className="relative pt-8 pb-14 lg:pt-12 lg:pb-20 overflow-hidden">
      <AmbientBackground />

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Focused Value Proposition & Dual Actions */}
          <div className="lg:col-span-6 space-y-5">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase text-[#087D94] dark:text-[#22D3D5]"
            >
              CONNECTED DENTAL GROWTH SYSTEM
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[34px] sm:text-[46px] lg:text-[54px] leading-[1.08] font-bold tracking-tight text-[#102338] dark:text-[#F5FAFF] text-balance"
            >
              More Than Marketing. A{' '}
              <span className="bg-gradient-to-r from-[#087D94] via-[#13AFA8] to-[#2563EB] dark:from-[#22D3D5] dark:via-[#43B5EC] dark:to-[#6476ED] bg-clip-text text-transparent">
                Smarter Way to Grow
              </span>{' '}
              Your Dental Practice.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-[17px] leading-[1.6] text-[#46596A] dark:text-[#B8C8D8] max-w-[54ch]"
            >
              Connect your clinic’s social media, paid campaigns, inquiry capture, and AI-assisted
              follow-up into one organized path from patient interest to booked consultation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1"
            >
              <motion.button
                type="button"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate('#offer')}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-white bg-[#087D94] hover:bg-[#06687C] dark:bg-gradient-to-r dark:from-[#22D3D5] dark:to-[#43B5EC] dark:text-[#080E1D] shadow-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Build My Growth System</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </motion.button>

              <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-[#102338] dark:text-[#F5FAFF] border border-[#DCE7EE] dark:border-[#304258] bg-white/85 dark:bg-[#152337]/85 hover:border-[#087D94] dark:hover:border-[#22D3D5] transition-colors whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-4 h-4 text-[#087D94] dark:text-[#22D3D5]" aria-hidden="true" />
                <span>WhatsApp · 0306-0069993</span>
              </motion.a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.24 }}
              className="text-xs sm:text-sm text-[#46596A] dark:text-[#B8C8D8]"
            >
              Designed for dental clinics · Start via application form or direct WhatsApp.
            </motion.p>
          </div>

          {/* Right Column: Pure Interactive 3D Growth Core */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <HeroGrowth3D />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

