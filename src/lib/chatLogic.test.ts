import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildContextualWhatsAppPrompt,
  buildDentPropelSystemInstruction,
  buildGeminiChatSessionInput,
  parseChatMessageBlocks,
  sanitizeChatMessages,
  selectGeminiChatModel,
} from './chatLogic';

test('selectGeminiChatModel selects fast and standard models cleanly', () => {
  assert.equal(selectGeminiChatModel('standard'), 'gemini-4-hydrogen');
  assert.equal(selectGeminiChatModel('fast'), 'gemini-3.1-flash-lite');
  assert.equal(selectGeminiChatModel(undefined), 'gemini-4-hydrogen');
});

test('sanitizeChatMessages drops invalid roles/empty entries and trims text', () => {
  const result = sanitizeChatMessages([
    { role: 'system', text: 'ignored' },
    { role: 'user', text: '   ' },
    { role: 'user', text: '  How does Dent Propel follow up work?  ' },
    { role: 'model', text: 'It sends instant acknowledgments and notifies reception.' },
  ]);

  assert.equal(result.length, 2);
  assert.deepEqual(result[0], {
    role: 'user',
    text: 'How does Dent Propel follow up work?',
  });
});

test('buildGeminiChatSessionInput separates prior history and latest user turn cleanly', () => {
  const session = buildGeminiChatSessionInput([
    { role: 'model', text: 'Leading welcome greeting should be stripped from history' },
    { role: 'user', text: 'What is included in Stage 1?' },
    { role: 'model', text: 'Stage 1 covers social media strategy and local ad campaigns.' },
    { role: 'user', text: 'Is ad spend included?' },
  ]);

  assert.equal(session.latestMessage, 'Is ad spend included?');
  assert.equal(session.history.length, 2);
  assert.equal(session.history[0].role, 'user');
  assert.equal(session.history[1].role, 'model');
  assert.equal(session.history[0].parts[0].text, 'What is included in Stage 1?');
});

test('buildGeminiChatSessionInput rejects threads not ending with a user message', () => {
  const session = buildGeminiChatSessionInput([
    { role: 'user', text: 'Hello' },
    { role: 'model', text: 'Hi there!' },
  ]);
  assert.equal(session.latestMessage, null);
  assert.equal(session.history.length, 0);
});

test('system instruction and contextual WhatsApp prompts include clinic scope context', () => {
  const instruction = buildDentPropelSystemInstruction('/checkout');
  assert.match(instruction, /0306-0069993/);
  assert.match(instruction, /\/checkout/);

  const checkoutPrompt = buildContextualWhatsAppPrompt('/checkout', 9);
  assert.match(checkoutPrompt, /9 selected modules/);
  assert.match(checkoutPrompt, /checkout/i);
});

test('parseChatMessageBlocks strips bullet markers and extracts bold spans safely', () => {
  const blocks = parseChatMessageBlocks(
    'Overview:\n*   **Attract:** Social media and ads.\n- Call **0306-0069993** anytime.',
  );
  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].type, 'paragraph');
  assert.equal(blocks[1].type, 'bullet');
  assert.deepEqual(blocks[1].segments, [
    { text: 'Attract:', bold: true },
    { text: ' Social media and ads.', bold: false },
  ]);
  assert.equal(blocks[2].type, 'bullet');
  assert.deepEqual(blocks[2].segments, [
    { text: 'Call ', bold: false },
    { text: '0306-0069993', bold: true },
    { text: ' anytime.', bold: false },
  ]);
});
