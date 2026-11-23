import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { useFunnel } from '../context/FunnelContext';
import { buildContextualWhatsAppPrompt } from '../lib/chatLogic';
import { buildWhatsAppRedirectUrl, DEFAULT_WHATSAPP_NUMBER } from '../lib/funnelLogic';

export interface FloatingWhatsAppButtonProps {
  phoneNumber?: string | null;
  message?: string;
  label?: string;
  className?: string;
}

export function FloatingWhatsAppButton({
  phoneNumber,
  message,
  label = 'WhatsApp · 0306-0069993',
  className = 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40',
}: FloatingWhatsAppButtonProps) {
  const { config, route, selectedDeliverableIds } = useFunnel();

  const resolvedPhone =
    phoneNumber ?? config.contact.whatsapp ?? DEFAULT_WHATSAPP_NUMBER;
  const resolvedMessage =
    message ?? buildContextualWhatsAppPrompt(route, selectedDeliverableIds.length);
  const whatsappUrl = buildWhatsAppRedirectUrl(resolvedPhone, resolvedMessage);

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp (03060069993)"
      title="Chat with Dent Propel on WhatsApp (03060069993)"
      data-testid="floating-whatsapp-button"
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${className} inline-flex items-center justify-center gap-2.5 h-11 w-11 sm:h-12 sm:w-auto sm:px-4 rounded-2xl border border-[#16A34A]/45 dark:border-[#25D366]/55 bg-white/95 dark:bg-[#101B2B]/95 text-[#102338] dark:text-[#F5FAFF] shadow-lg backdrop-blur-md hover:border-[#16A34A] dark:hover:border-[#25D366] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] transition-colors whitespace-nowrap shrink-0`}
    >
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-[#16A34A] dark:bg-[#25D366] text-white dark:text-[#080E1D] shrink-0">
        <MessageCircle className="w-4 h-4" aria-hidden="true" />
      </span>
      <span className="hidden sm:inline text-sm font-semibold tracking-tight">
        {label}
      </span>
    </motion.a>
  );
}
