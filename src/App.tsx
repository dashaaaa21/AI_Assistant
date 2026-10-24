import { useEffect, useRef, useState } from 'react';
import type { Chat, Message, Sender } from './types';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import MessageBubble, { TypingIndicator } from './components/MessageBubble';
import MessageInput from './components/MessageInput';
import { MenuIcon, MoonIcon, PlusIcon, SunIcon } from './components/Icons';
import { createId } from './utils/id';
import { loadChats, saveChats } from './utils/storage';
import { getFakeReply } from './utils/fakeAI';
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
    setReplyingChatId(id);

    try {
      const reply = await getFakeReply(text);
      addMessage(id, createMessage('assistant', reply));
    } catch {
      addMessage(id, createMessage('assistant', 'Sorry, something went wrong. Please try again.'));
    } finally {
      setReplyingChatId(null);
    }
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

  return (
    <div className="app">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        isOpen={sidebarOpen}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="chat">
        <header className="chat-header">
          <button className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <MenuIcon />
          </button>
          <h2 className="chat-title">{activeChat?.title ?? 'New chat'}</h2>
          <button
            className="icon-button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className="icon-button" onClick={handleNewChat} aria-label="New chat">
            <PlusIcon />
          </button>
        </header>

        <div className="chat-messages">
          {activeChat && activeChat.messages.length > 0 ? (
            <div className="message-list">
              {activeChat.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {replyingChatId === activeChat.id && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <WelcomeScreen onPromptClick={handleSend} />
          )}
        </div>

        <MessageInput onSend={handleSend} disabled={isReplying} />
      </main>
    </div>
  );
}
