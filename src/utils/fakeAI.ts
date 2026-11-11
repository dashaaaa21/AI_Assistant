// A pretend AI. It waits a moment (like a real AI "thinking"),
// then picks a reply based on words in your message.
// Later, you can replace getFakeReply with a call to a real AI service –
// the rest of the app will not need to change.

interface ReplyRule {
  keywords: string[];
  reply: string;
}

const rules: ReplyRule[] = [
  {
    keywords: ['hello', 'hi', 'hey'],
    reply:
      "Hello! 👋 I'm your assistant. Right now I'm a simulation, so my answers are pre-written — but the chat works just like the real thing. What would you like to talk about?",
  },
  {
    keywords: ['explain', 'internet'],
    reply:
      "Here's a simple way to think about it:\n\n1. **Your device** sends a request, like asking for a web page.\n2. The request travels through **routers** — think of them as post offices passing a letter along.\n3. It reaches a **server**, a computer that stores the website.\n4. The server sends the page back the same way, in small pieces called **packets**.\n\nYour browser puts the pieces together and shows you the page — all in a fraction of a second.",
  },
  {
    keywords: ['poem', 'ocean'],
    reply:
      'Waves fold softly into sand,\nwhispers carried, unplanned.\nBlue that stretches, calm and wide —\nthe ocean breathes with every tide.',
  },
  {
    keywords: ['idea', 'ideas', 'trip', 'weekend'],
    reply:
      "Here are a few weekend ideas:\n\n• **Nature day** — pick a nearby trail, pack a picnic and go offline for a few hours.\n• **City explorer** — visit a museum or neighborhood you've never been to.\n• **Food tour** — try three small local places in one afternoon.\n• **Slow weekend** — books, a long walk and a new recipe at home.\n\nWant me to help plan one of these in detail?",
  },
  {
    keywords: ['plan', 'schedule', 'study'],
    reply:
      "Here's a simple, productive study schedule:\n\n1. **25 minutes** of focused study (no phone!).\n2. **5 minutes** break — stretch or drink water.\n3. Repeat 4 times, then take a **longer 20-minute break**.\n4. Start each day with the hardest subject while your energy is high.\n5. End the day with a **10-minute review** of what you learned.\n\nThis is called the Pomodoro technique — small steps add up quickly.",
  },
  {
    keywords: ['code', 'react', 'typescript', 'javascript'],
    reply:
      'Great topic! In React, you build your interface from small pieces called **components**. Each component is a function that returns what should appear on the screen. TypeScript adds types, so your editor can catch mistakes before you even run the code.',
  },
];

const fallbackReplies = [
  "That's an interesting question! I'm a simulated assistant for now, so I can't give a real answer yet — but once a real AI is connected, this is where the response will appear.",
  "Thanks for your message! This is a demo reply. Try one of the example prompts on the welcome screen to see some more detailed answers.",
  "Good point. I'm currently running in demo mode, so my replies are pre-written. The chat history, layout and typing animation all work for real, though!",
];

/** Waits for the given number of milliseconds. */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Returns true if `text` contains `word` as a whole word ("hi" won't match "this"). */
function containsWord(text: string, word: string): boolean {
  return new RegExp(`\\b${word}\\b`, 'i').test(text);
}

/** Returns a simulated AI reply after a short delay. */
export async function getFakeReply(userText: string): Promise<string> {
  // Random delay between 0.8 and 1.6 seconds, to feel natural.
  await wait(800 + Math.random() * 800);

  const rule = rules.find((r) => r.keywords.some((k) => containsWord(userText, k)));
  if (rule) return rule.reply;

  return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
}
