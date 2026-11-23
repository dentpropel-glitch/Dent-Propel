import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useFunnel } from '../context/FunnelContext';
import { buildWhatsAppRedirectUrl } from '../lib/funnelLogic';

export function FinalCTASection() {
  const { config, navigate } = useFunnel();
  const whatsappUrl = buildWhatsAppRedirectUrl(
    config.contact.whatsapp,
    'Hello Dent Propel, I would like to start a Growth System inquiry for my dental clinic.',
  );

  return (
    <section className="relative py-16 lg:py-24 bg-[#080E1D] text-[#F5FAFF] overflow-hidden">
      {/* Subtle Grid & Animated Orbital Geometry Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(48,66,88,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(48,66,88,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none dp-ambient-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[360px] rounded-full bg-gradient-to-r from-[#22D3D5]/20 to-[#6476ED]/20 blur-[110px]"
      />

      {/* Kinetic Orbital Motion Graphics */}
      <svg
        aria-hidden="true"
        viewBox="0 0 900 480"
        className="pointer-events-none absolute inset-0 w-full h-full opacity-40"
      >
        <defs>
          <linearGradient id="dpCtaOrbit" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3D5" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#6476ED" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 48, ease: 'linear' }}
          style={{ transformOrigin: '450px 240px' }}
        >
          <ellipse
            cx="450"
            cy="240"
            rx="340"
            ry="135"
            fill="none"
            stroke="url(#dpCtaOrbit)"
            strokeWidth="1"
            strokeDasharray="6 10"
          />
          <circle cx="790" cy="240" r="4" fill="#22D3D5" />
        </motion.g>
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 36, ease: 'linear' }}
          style={{ transformOrigin: '450px 240px' }}
        >
          <ellipse
            cx="450"
            cy="240"
            rx="240"
            ry="175"
            fill="none"
            stroke="url(#dpCtaOrbit)"
            strokeWidth="1"
            strokeDasharray="3 8"
          />
          <circle cx="210" cy="240" r="3.5" fill="#6476ED" />
        </motion.g>
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-[860px] mx-auto px-4 sm:px-6 text-center space-y-5"
      >
        <p className="text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase text-[#22D3D5]">
          Ready When Your Practice Is
        </p>

        <h2 className="font-display text-3xl sm:text-4xl lg:text-[48px] leading-[1.1] font-bold tracking-tight text-balance">
          Your Dental Practice Deserves a Smarter Growth System.
        </h2>

        <p className="text-base sm:text-lg leading-relaxed text-[#B8C8D8] max-w-[54ch] mx-auto">
          Complete the quick clinic application form or message us directly on WhatsApp to start.
        </p>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            type="button"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/checkout')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-base font-semibold text-[#080E1D] bg-gradient-to-r from-[#22D3D5] to-[#43B5EC] hover:opacity-95 transition-opacity shadow-[0_12px_32px_rgba(34,211,213,0.28)] whitespace-nowrap cursor-pointer"
          >
            <span>Start With Application Form</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </motion.button>

          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-[#F5FAFF] border border-[#304258] bg-[#101B2B]/85 hover:border-[#22D3D5]/60 transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 text-[#22D3D5]" aria-hidden="true" />
            <span>WhatsApp · 0306-0069993</span>
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}

