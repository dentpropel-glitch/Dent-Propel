export type ChatRole = 'user' | 'model';
export type ChatSpeedMode = 'standard' | 'fast';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  modelUsed?: string;
}

export interface GeminiHistoryEntry {
  role: ChatRole;
  parts: Array<{ text: string }>;
}

export const GEMINI_CHAT_MODELS: Record<ChatSpeedMode, string> = {
  standard: 'gemini-4-hydrogen',
  fast: 'gemini-3.1-flash-lite',
};

export const MAX_CHAT_HISTORY_TURNS = 20;
export const MAX_CHAT_MESSAGE_LENGTH = 1500;

export function selectGeminiChatModel(speedMode: unknown): string {
  return speedMode === 'fast'
    ? GEMINI_CHAT_MODELS.fast
    : GEMINI_CHAT_MODELS.standard;
}

export function sanitizeChatMessages(rawMessages: unknown): Array<{ role: ChatRole; text: string }> {
  if (!Array.isArray(rawMessages)) return [];
  const cleaned: Array<{ role: ChatRole; text: string }> = [];

  for (const item of rawMessages) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const role = record.role === 'user' || record.role === 'model' ? record.role : null;
    const rawText = typeof record.text === 'string' ? record.text.trim() : '';
    if (!role || !rawText) continue;

    cleaned.push({
      role,
      text: rawText.slice(0, MAX_CHAT_MESSAGE_LENGTH),
    });
  }

  return cleaned.slice(-MAX_CHAT_HISTORY_TURNS);
}

export function buildGeminiChatSessionInput(
  rawMessages: unknown,
): {
  history: GeminiHistoryEntry[];
  latestMessage: string | null;
} {
  const sanitized = sanitizeChatMessages(rawMessages);
  if (sanitized.length === 0) {
    return { history: [], latestMessage: null };
  }

  const last = sanitized[sanitized.length - 1];
  if (last.role !== 'user') {
    return { history: [], latestMessage: null };
  }

  const prior = sanitized.slice(0, -1);
  // Gemini chat history should begin with a user turn when non-empty
  const firstUserIdx = prior.findIndex((m) => m.role === 'user');
  const trimmedPrior = firstUserIdx >= 0 ? prior.slice(firstUserIdx) : [];

  return {
    history: trimmedPrior.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    latestMessage: last.text,
  };
}

export function buildDentPropelSystemInstruction(route?: string): string {
  const routeNote = route
    ? `The visitor is currently viewing the "${route}" page.`
    : 'The visitor is browsing the Dent Propel website.';

  return [
    'You are the Dent Propel Practice Growth Concierge, a knowledgeable and concise assistant for dental clinic owners and practice managers.',
    'Explain how Dent Propel connects dental marketing (social media strategy & management, local Meta campaigns, treatment landing pages), patient inquiry capture, AI-assisted reception follow-up, and booking visibility into one structured 5-stage system (Attract, Capture, Follow Up, Book, Optimize).',
    'Clarify key boundaries accurately: paid advertising spend is paid directly by the clinic to the ad platform; AI workflows support front-desk teams rather than replacing human receptionists; live card billing is only active when a payment gateway is configured (otherwise clinic applications run in Checkout Preview Mode with zero card charges).',
    'Never invent pricing numbers if not configured, never give clinical/dental medical advice, and when the user wants direct human scoping or instant chat, invite them to use the clinic application form or WhatsApp at 0306-0069993.',
    'Keep responses well-structured, concise (2-4 short sentences or up to 4 crisp bullet points using "- "), and avoid Markdown headings (#) or excessive asterisks.',
    routeNote,
  ].join(' ');
}

export interface ChatTextSegment {
  text: string;
  bold: boolean;
}

export interface ChatMessageBlock {
  type: 'paragraph' | 'bullet';
  segments: ChatTextSegment[];
}

function parseBoldSegments(line: string): ChatTextSegment[] {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  const segments: ChatTextSegment[] = [];

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      segments.push({ text: part.slice(2, -2), bold: true });
    } else {
      segments.push({ text: part, bold: false });
    }
  }

  return segments.length > 0 ? segments : [{ text: line, bold: false }];
}

export function parseChatMessageBlocks(text: string): ChatMessageBlock[] {
  const lines = text.split(/\r?\n/);
  const blocks: ChatMessageBlock[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const bulletMatch = /^[-*•]\s+(.+)$/.exec(trimmed);
    if (bulletMatch) {
      blocks.push({
        type: 'bullet',
        segments: parseBoldSegments(bulletMatch[1].trim()),
      });
    } else {
      blocks.push({
        type: 'paragraph',
        segments: parseBoldSegments(trimmed),
      });
    }
  }

  return blocks;
}

export function buildContextualWhatsAppPrompt(
  route: string,
  selectedDeliverableCount: number,
): string {
  if (route === '/checkout') {
    return `Hello Dent Propel, I am on the clinic application checkout page (${selectedDeliverableCount} selected modules) and would like direct assistance on WhatsApp.`;
  }
  if (route === '/thank-you') {
    return 'Hello Dent Propel, I just completed my clinic application and would like to connect on WhatsApp for next steps.';
  }
  return `Hello Dent Propel, I would like to discuss the Dental Practice Growth System (${selectedDeliverableCount} modules) for my clinic.`;
}
