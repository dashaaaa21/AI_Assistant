import { Fragment, useEffect, useRef, useState } from 'react';
import type { Chat, Message, Sender } from './types';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import MessageBubble, { TypingIndicator } from './components/MessageBubble';
import MessageInput from './components/MessageInput';
import { ArrowDownIcon, DownloadIcon, MenuIcon, MoonIcon, PlusIcon, SunIcon } from './components/Icons';
import { createId } from './utils/id';
import { loadChats, saveChats } from './utils/storage';
import { getFakeReply } from './utils/fakeAI';
import { downloadChat } from './utils/exportChat';
import { formatDay, isSameDay } from './utils/dateGroups';
import { applyTheme, loadTheme, saveTheme } from './utils/theme';
import type { Theme } from './utils/theme';
import './App.css';

const TITLE_LENGTH = 40;

/** Uses the first message as the chat title, shortened if it is long. */
function makeTitle(text: string): string {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  return oneLine.length > TITLE_LENGTH ? oneLine.slice(0, TITLE_LENGTH).trimEnd() + '…' : oneLine;
}

function createMessage(sender: Sender, text: string): Message {
  return { id: createId(), sender, text, createdAt: Date.now() };
}

export default function App() {
  const [chats, setChats] = useState<Chat[]>(loadChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(() => loadChats()[0]?.id ?? null);
  // The chat that is waiting for an assistant reply (null when none).
  const [replyingChatId, setReplyingChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(loadTheme);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const requestIdRef = useRef(0);

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null;
  const isReplying = replyingChatId !== null;

  // Save chats in the browser every time they change.
  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  // Apply the theme to the page and remember it.
  useEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);

  // Scroll to the newest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages.length, replyingChatId, activeChatId]);

  // Keyboard shortcuts: Ctrl/Cmd + K – new chat, Esc – stop the reply.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        handleNewChat();
      } else if (event.key === 'Escape' && isReplying) {
        handleStop();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  /** Shows the "scroll to bottom" button when you scroll up through the history. */
  function handleMessagesScroll() {
    const el = messagesRef.current;
    if (!el) return;
    setShowScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  /** Adds a message to a chat and moves that chat to the top of the list. */
  function addMessage(chatId: string, message: Message) {
    setChats((prev) => {
      const chat = prev.find((c) => c.id === chatId);
      if (!chat) return prev;
      const updated: Chat = {
        ...chat,
        messages: [...chat.messages, message],
        updatedAt: message.createdAt,
      };
      return [updated, ...prev.filter((c) => c.id !== chatId)];
    });
  }

  async function handleSend(text: string) {
    if (isReplying) return;

    let chatId = activeChatId;
    if (!activeChat) {
      const now = Date.now();
      const newChat: Chat = {
        id: createId(),
        title: makeTitle(text),
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      chatId = newChat.id;
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
    }

    const id = chatId!;
    addMessage(id, createMessage('user', text));
    await requestReply(id, text);
  }

  /** Asks the assistant to answer `text` and adds the reply to the chat. */
  async function requestReply(chatId: string, text: string) {
    // Each request gets a number; if it changes (Stop was pressed), the reply is ignored.
    const requestId = ++requestIdRef.current;
    setReplyingChatId(chatId);

    let reply: string;
    try {
      reply = await getFakeReply(text);
    } catch {
      reply = 'Sorry, something went wrong. Please try again.';
    }

    if (requestId !== requestIdRef.current) return;
    addMessage(chatId, createMessage('assistant', reply));
    setReplyingChatId(null);
  }

  function handleStop() {
    requestIdRef.current++;
    setReplyingChatId(null);
  }

  /** Replaces the last assistant reply with a new one. */
  function handleRegenerate() {
    if (!activeChat || isReplying) return;
    const messages = activeChat.messages;
    const lastUser = [...messages].reverse().find((m) => m.sender === 'user');
    if (!lastUser) return;

    if (messages[messages.length - 1].sender === 'assistant') {
      setChats((prev) =>
        prev.map((chat) => (chat.id === activeChat.id ? { ...chat, messages: chat.messages.slice(0, -1) } : chat)),
      );
    }
    requestReply(activeChat.id, lastUser.text);
  }

  function handleNewChat() {
    setActiveChatId(null);
    setSidebarOpen(false);
  }

  function handleSelectChat(id: string) {
    setActiveChatId(id);
    setSidebarOpen(false);
  }

  function handleDeleteChat(id: string) {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    if (id === activeChatId) setActiveChatId(null);
  }

  function handleClearAll() {
    if (replyingChatId) handleStop();
    setChats([]);
    setActiveChatId(null);
  }

  function handleRenameChat(id: string, title: string) {
    setChats((prev) => prev.map((chat) => (chat.id === id ? { ...chat, title } : chat)));
  }

  return (
    <div className="app">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        isOpen={sidebarOpen}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onClearAll={handleClearAll}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="chat">
        <header className="chat-header">
          <button className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <MenuIcon />
          </button>
          <h2 className="chat-title">{activeChat?.title ?? 'New chat'}</h2>
          {activeChat && activeChat.messages.length > 0 && (
            <button
              className="icon-button"
              onClick={() => downloadChat(activeChat)}
              aria-label="Export chat"
              title="Export chat (.md)"
            >
              <DownloadIcon />
            </button>
          )}
          <button
            className="icon-button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className="icon-button" onClick={handleNewChat} aria-label="New chat" title="New chat (Ctrl/Cmd + K)">
            <PlusIcon />
          </button>
        </header>

        <div className="chat-body">
          <div className="chat-messages" ref={messagesRef} onScroll={handleMessagesScroll}>
            {activeChat && activeChat.messages.length > 0 ? (
              <div className="message-list">
                {activeChat.messages.map((message, index) => {
                  const isLastReply =
                    index === activeChat.messages.length - 1 && message.sender === 'assistant' && !isReplying;
                  const previous = activeChat.messages[index - 1];
                  const startsNewDay = !previous || !isSameDay(previous.createdAt, message.createdAt);
                  return (
                    <Fragment key={message.id}>
                      {startsNewDay && <div className="day-separator">{formatDay(message.createdAt)}</div>}
                      <MessageBubble message={message} onRegenerate={isLastReply ? handleRegenerate : undefined} />
                    </Fragment>
                  );
                })}
                {replyingChatId === activeChat.id && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <WelcomeScreen onPromptClick={handleSend} />
            )}
          </div>
          {showScrollDown && activeChat && (
            <button className="scroll-down-button" onClick={scrollToBottom} aria-label="Scroll to bottom">
              <ArrowDownIcon />
            </button>
          )}
        </div>

        <MessageInput onSend={handleSend} onStop={handleStop} disabled={isReplying} />
      </main>
    </div>
  );
}
