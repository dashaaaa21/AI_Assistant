// These "types" describe the shape of our data.
// TypeScript uses them to warn us if we use the data incorrectly.

/** Who wrote a message: you (the user) or the AI (the assistant). */
export type Sender = 'user' | 'assistant';

/** One message in a conversation. */
export interface Message {
  id: string;
  sender: Sender;
  text: string;
  createdAt: number; // time in milliseconds (from Date.now())
}

/** One conversation, shown as an item in the sidebar. */
export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
