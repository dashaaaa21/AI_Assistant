import type { Chat } from '../types';

/** Turns a chat into a Markdown document. */
export function chatToMarkdown(chat: Chat): string {
  const lines = [`# ${chat.title}`, '', `_Exported ${new Date().toLocaleString()}_`, ''];
  for (const message of chat.messages) {
    const author = message.sender === 'user' ? 'You' : 'Assistant';
    lines.push(`### ${author} · ${new Date(message.createdAt).toLocaleString()}`, '', message.text, '');
  }
  return lines.join('\n');
}

/** Makes a safe file name from the chat title, e.g. "Trip ideas!" -> "trip-ideas". */
function toFileName(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'chat';
}

/** Downloads the chat as a .md file. */
export function downloadChat(chat: Chat): void {
  const blob = new Blob([chatToMarkdown(chat)], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${toFileName(chat.title)}.md`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
