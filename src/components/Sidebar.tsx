import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { Chat } from '../types';
import { ChatIcon, CloseIcon, EditIcon, PlusIcon, SearchIcon, SparkIcon, TrashIcon } from './Icons';
import './Sidebar.css';

// "Props" are the inputs a component receives from its parent (App).
interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  isOpen: boolean; // only matters on mobile
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onClose: () => void;
}

export default function Sidebar({
  chats,
  activeChatId,
  isOpen,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onClose,
}: SidebarProps) {
  const [query, setQuery] = useState('');
  // The chat whose title is being edited, and the text typed so far.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  function startRename(chat: Chat) {
    setEditingId(chat.id);
    setDraftTitle(chat.title);
  }

  function finishRename() {
    if (editingId && draftTitle.trim()) onRenameChat(editingId, draftTitle.trim());
    setEditingId(null);
  }

  function handleRenameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') finishRename();
    if (event.key === 'Escape') setEditingId(null);
  }

  // Show chats whose title or messages contain the search text.
  const search = query.trim().toLowerCase();
  const visibleChats = search
    ? chats.filter(
        (chat) =>
          chat.title.toLowerCase().includes(search) ||
          chat.messages.some((m) => m.text.toLowerCase().includes(search)),
      )
    : chats;

  return (
    <>
      {/* Dark background behind the sidebar on mobile. Tap it to close. */}
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-logo">
              <SparkIcon size={16} />
            </span>
            <span className="brand-name">Assistant</span>
          </div>
          <button className="icon-button sidebar-close" onClick={onClose} aria-label="Close sidebar">
            <CloseIcon />
          </button>
        </div>

        <button className="new-chat-button" onClick={onNewChat}>
          <PlusIcon size={16} />
          New chat
        </button>

        {chats.length > 0 && (
          <label className="chat-search">
            <SearchIcon size={15} />
            <input
              type="search"
              value={query}
              placeholder="Search chats"
              aria-label="Search chats"
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        )}

        <nav className="chat-list" aria-label="Chat history">
          {chats.length === 0 ? (
            <p className="chat-list-empty">Your conversations will appear here.</p>
          ) : visibleChats.length === 0 ? (
            <p className="chat-list-empty">No chats found.</p>
          ) : (
            <>
              <p className="chat-list-label">{search ? 'Results' : 'Recent'}</p>
              <ul>
                {visibleChats.map((chat) => (
                  <li key={chat.id}>
                    <div className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}>
                      {editingId === chat.id ? (
                        <input
                          className="chat-item-rename"
                          value={draftTitle}
                          autoFocus
                          aria-label="Chat name"
                          onChange={(e) => setDraftTitle(e.target.value)}
                          onKeyDown={handleRenameKeyDown}
                          onBlur={finishRename}
                        />
                      ) : (
                        <>
                          <button
                            className="chat-item-select"
                            onClick={() => onSelectChat(chat.id)}
                            onDoubleClick={() => startRename(chat)}
                          >
                            <ChatIcon size={15} />
                            <span className="chat-item-title">{chat.title}</span>
                          </button>
                          <button
                            className="chat-item-action"
                            onClick={() => startRename(chat)}
                            aria-label={`Rename chat "${chat.title}"`}
                          >
                            <EditIcon size={14} />
                          </button>
                          <button
                            className="chat-item-action chat-item-delete"
                            onClick={() => onDeleteChat(chat.id)}
                            aria-label={`Delete chat "${chat.title}"`}
                          >
                            <TrashIcon size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>

        <div className="sidebar-footer">Demo mode · simulated replies</div>
      </aside>
    </>
  );
}
