import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  Loader2,
  MessageSquareText,
  RotateCcw,
  Send,
  X,
} from 'lucide-react';
import { useFunnel } from '../context/FunnelContext';
import {
  GEMINI_CHAT_MODELS,
  parseChatMessageBlocks,
  type ChatMessage,
  type ChatSpeedMode,
} from '../lib/chatLogic';
import { buildWhatsAppRedirectUrl, DEFAULT_WHATSAPP_NUMBER } from '../lib/funnelLogic';

const STARTER_PROMPTS = [
  'How does the 5-stage system work?',
  'Is paid ad spend included?',
  'How does AI follow-up support reception?',
];

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'model',
  text: 'Welcome to Dent Propel. Ask about our 5-stage clinic growth workflow, included modules, or how to get started.',
};

export function GeminiChatWidget() {
  const { config, route } = useFunnel();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [speedMode, setSpeedMode] = useState<ChatSpeedMode>('standard');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [isOpen, messages, isSending, errorMsg]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isSending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextThread = [...messages, userMsg];
    setMessages(nextThread);
    setInput('');
    setErrorMsg(null);
    setIsSending(true);

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route,
          speedMode,
          messages: nextThread.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = (await resp.json()) as {
        reply?: string;
        modelUsed?: string;
        error?: string;
      };

      if (!resp.ok || !data.reply) {
        setErrorMsg(
          data.error ||
            'Unable to get a response right now. Please try again or reach us on WhatsApp.',
        );
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text: data.reply!,
          modelUsed: data.modelUsed,
        },
      ]);
    } catch {
      setErrorMsg('Network error contacting the assistant. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([INITIAL_WELCOME_MESSAGE]);
    setErrorMsg(null);
    setInput('');
  };

  const whatsappFallbackUrl = buildWhatsAppRedirectUrl(
    config.contact.whatsapp || DEFAULT_WHATSAPP_NUMBER,
    'Hello Dent Propel, I would like to speak with your team about the Clinic Growth System.',
  );

  return (
    <>
      {/* Launcher Button stacked cleanly above FloatingWhatsAppButton on desktop, adjacent on mobile */}
      {!isOpen && (
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Practice Growth Chat Assistant"
          data-testid="gemini-chat-launcher"
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="fixed bottom-4 right-[4.25rem] sm:bottom-[5.25rem] sm:right-6 z-40 inline-flex items-center justify-center gap-2 h-11 w-11 sm:w-auto sm:px-4 rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-white/95 dark:bg-[#152337]/95 text-[#102338] dark:text-[#F5FAFF] shadow-lg backdrop-blur-md hover:border-[#087D94] dark:hover:border-[#22D3D5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#087D94] dark:focus-visible:ring-[#22D3D5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-[#087D94] dark:bg-[#22D3D5] text-white dark:text-[#080E1D] shrink-0">
            <MessageSquareText className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline text-sm font-semibold tracking-tight">
            Clinic Assistant
          </span>
        </motion.button>
      )}

      {/* Multi-turn Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            role="dialog"
            aria-label="Dent Propel Practice Concierge Chat"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-18 right-4 sm:bottom-[5.25rem] sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[460px] max-h-[72vh] rounded-2xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#101B2B] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#152337] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-display text-sm font-bold text-[#102338] dark:text-[#F5FAFF] truncate">
                  Practice Concierge
                </h2>
                <div className="text-[11px] font-mono-tabular text-[#46596A] dark:text-[#B8C8D8] truncate">
                  {GEMINI_CHAT_MODELS[speedMode]}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div
                  role="group"
                  aria-label="Response speed mode"
                  className="inline-flex items-center p-0.5 rounded-lg border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#101B2B]"
                >
                  <button
                    type="button"
                    onClick={() => setSpeedMode('standard')}
                    aria-pressed={speedMode === 'standard'}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      speedMode === 'standard'
                        ? 'bg-[#087D94] dark:bg-[#22D3D5] text-white dark:text-[#080E1D]'
                        : 'text-[#46596A] dark:text-[#B8C8D8]'
                    }`}
                  >
                    Balanced
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeedMode('fast')}
                    aria-pressed={speedMode === 'fast'}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      speedMode === 'fast'
                        ? 'bg-[#087D94] dark:bg-[#22D3D5] text-white dark:text-[#080E1D]'
                        : 'text-[#46596A] dark:text-[#B8C8D8]'
                    }`}
                  >
                    Fast
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  className="p-1.5 rounded-lg border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#101B2B] text-[#46596A] dark:text-[#B8C8D8] hover:text-[#102338] dark:hover:text-[#F5FAFF] cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close chat"
                  className="p-1.5 rounded-lg border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#101B2B] text-[#46596A] dark:text-[#B8C8D8] hover:text-[#102338] dark:hover:text-[#F5FAFF] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Scrollable Message Thread */}
            <div
              ref={threadRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {messages.map((msg) => {
                const blocks = parseChatMessageBlocks(msg.text);
                return (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed space-y-1.5 ${
                        msg.role === 'user'
                          ? 'bg-[#087D94] dark:bg-[#22D3D5] text-white dark:text-[#080E1D] font-medium'
                          : 'bg-[#F6F9FC] dark:bg-[#152337] border border-[#DCE7EE] dark:border-[#304258] text-[#102338] dark:text-[#F5FAFF]'
                      }`}
                    >
                      {blocks.map((block, bIdx) => (
                        <div
                          key={bIdx}
                          className={block.type === 'bullet' ? 'flex items-start gap-1.5' : undefined}
                        >
                          {block.type === 'bullet' && (
                            <span
                              aria-hidden="true"
                              className="text-[#087D94] dark:text-[#22D3D5] font-bold mt-[1px]"
                            >
                              •
                            </span>
                          )}
                          <span>
                            {block.segments.map((seg, sIdx) =>
                              seg.bold ? (
                                <strong key={sIdx} className="font-semibold">
                                  {seg.text}
                                </strong>
                              ) : (
                                <React.Fragment key={sIdx}>{seg.text}</React.Fragment>
                              ),
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {messages.length === 1 && (
                <div className="pt-1 space-y-1.5">
                  <div className="text-[11px] font-medium text-[#46596A] dark:text-[#B8C8D8]">
                    Quick questions:
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {STARTER_PROMPTS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => sendMessage(q)}
                        className="text-left px-3 py-2 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC]/70 dark:bg-[#152337]/70 hover:border-[#087D94] dark:hover:border-[#22D3D5] text-xs font-medium text-[#102338] dark:text-[#F5FAFF] transition-colors cursor-pointer"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isSending && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs bg-[#F6F9FC] dark:bg-[#152337] border border-[#DCE7EE] dark:border-[#304258] text-[#46596A] dark:text-[#B8C8D8]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#087D94] dark:text-[#22D3D5]" aria-hidden="true" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-[#102338] dark:text-[#F5FAFF] space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{errorMsg}</span>
                  </div>
                  <a
                    href={whatsappFallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-semibold text-[#087D94] dark:text-[#22D3D5] underline"
                  >
                    Continue on WhatsApp (0306-0069993) →
                  </a>
                </div>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-[#DCE7EE] dark:border-[#304258] bg-[#F6F9FC] dark:bg-[#152337] flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about modules, workflow, or setup..."
                aria-label="Message Dent Propel assistant"
                disabled={isSending}
                className="flex-1 min-w-0 px-3.5 py-2 rounded-xl border border-[#DCE7EE] dark:border-[#304258] bg-white dark:bg-[#101B2B] text-sm text-[#102338] dark:text-[#F5FAFF] placeholder-[#46596A]/65 dark:placeholder-[#B8C8D8]/50 focus:outline-none focus:ring-2 focus:ring-[#087D94] dark:focus:ring-[#22D3D5]"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                aria-label="Send message"
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-[#087D94] dark:bg-[#22D3D5] text-white dark:text-[#080E1D] disabled:opacity-45 transition-opacity shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
