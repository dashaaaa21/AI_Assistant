import type { Chat } from '../types';

export interface ChatGroup {
  label: string;
  chats: Chat[];
}

const DAY = 24 * 60 * 60 * 1000;

/** Splits chats (newest first) into Today / Yesterday / Previous 7 days / Older. */
export function groupChatsByDate(chats: Chat[], now = Date.now()): ChatGroup[] {
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const groups: ChatGroup[] = [
    { label: 'Today', chats: [] },
    { label: 'Yesterday', chats: [] },
    { label: 'Previous 7 days', chats: [] },
    { label: 'Older', chats: [] },
  ];

  for (const chat of chats) {
    const time = chat.updatedAt;
    if (time >= startOfToday) groups[0].chats.push(chat);
    else if (time >= startOfToday - DAY) groups[1].chats.push(chat);
    else if (time >= startOfToday - 7 * DAY) groups[2].chats.push(chat);
    else groups[3].chats.push(chat);
  }

  return groups.filter((group) => group.chats.length > 0);
}

/** A day label for a message: "Today", "Yesterday" or a date like "Aug 10, 2026". */
export function formatDay(timestamp: number, now = Date.now()): string {
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  if (timestamp >= startOfToday) return 'Today';
  if (timestamp >= startOfToday - DAY) return 'Yesterday';
  return new Date(timestamp).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

export function isSameDay(a: number, b: number): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}
