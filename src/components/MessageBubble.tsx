import { useEffect, useState } from 'react';
import type { Message } from '../types';
import { CheckIcon, CopyIcon, SparkIcon } from './Icons';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
}

/**
 * Turns "**bold**" in the text into real bold text.
 * We build React elements instead of inserting raw HTML, which keeps it safe.
 */
function formatText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Copies the message text and shows a check mark for a moment. */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard access can be blocked – nothing else to do.
    }
  }

  return (
    <button className="message-copy" onClick={copy} aria-label={copied ? 'Copied' : 'Copy message'}>
      {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`message ${isUser ? 'message-user' : 'message-assistant'}`}>
      {!isUser && (
        <div className="message-avatar">
          <SparkIcon size={15} />
        </div>
      )}
      <div className="message-content">
        <div className="message-bubble">{formatText(message.text)}</div>
        <div className="message-meta">
          <span className="message-time">{formatTime(message.createdAt)}</span>
          {!isUser && <CopyButton text={message.text} />}
        </div>
      </div>
    </div>
  );
}

/** The animated "..." shown while the assistant is "thinking". */
export function TypingIndicator() {
  return (
    <div className="message message-assistant" aria-live="polite" aria-label="Assistant is typing">
      <div className="message-avatar">
        <SparkIcon size={15} />
      </div>
      <div className="message-bubble typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
