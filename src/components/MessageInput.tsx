import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { SendIcon } from './Icons';
import './MessageInput.css';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled: boolean; // true while the assistant is replying
}

const MAX_HEIGHT = 200; // px – the box stops growing after this

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  // "State" is data a component remembers. Changing it re-draws the component.
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = text.trim().length > 0 && !disabled;

  /** Makes the text box grow to fit its content. */
  function resize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT) + 'px';
  }

  function send() {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
    // Shrink the box back after the text is cleared.
    requestAnimationFrame(resize);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter makes a new line.
    // isComposing avoids sending while typing with an input method (e.g. Japanese).
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  }

  return (
    <div className="input-area">
      <div className="input-box">
        <textarea
          ref={textareaRef}
          className="input-textarea"
          value={text}
          rows={1}
          placeholder="Message Assistant…"
          aria-label="Message"
          onChange={(e) => {
            setText(e.target.value);
            resize();
          }}
          onKeyDown={handleKeyDown}
        />
        <button className="send-button" onClick={send} disabled={!canSend} aria-label="Send message">
          <SendIcon size={18} />
        </button>
      </div>
      <p className="input-hint">Replies are simulated · Enter to send, Shift + Enter for a new line</p>
    </div>
  );
}
