import type { Chat } from '../types';

// localStorage is a small storage space inside the browser.
// Anything saved there is still available after you refresh the page.
const STORAGE_KEY = 'ai-assistant.chats';

/** Reads saved chats. Returns an empty list if nothing is saved yet. */
export function loadChats(): Chat[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Chat[]) : [];
  } catch {
    // Storage can be blocked (e.g. private browsing) – just start fresh.
    return [];
  }
}

/** Saves all chats. */
export function saveChats(chats: Chat[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch {
    // If saving fails, the app still works – chats just won't persist.
  }
}
