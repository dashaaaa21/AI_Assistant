import type { Chat } from '../types';
import { ChatIcon, CloseIcon, PlusIcon, SparkIcon, TrashIcon } from './Icons';
import './Sidebar.css';

// "Props" are the inputs a component receives from its parent (App).
interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  isOpen: boolean; // only matters on mobile
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onClose: () => void;
}

export default function Sidebar({
  chats,
  activeChatId,
  isOpen,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onClose,
}: SidebarProps) {
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

        <nav className="chat-list" aria-label="Chat history">
          {chats.length === 0 ? (
            <p className="chat-list-empty">Your conversations will appear here.</p>
          ) : (
            <>
              <p className="chat-list-label">Recent</p>
              <ul>
                {chats.map((chat) => (
                  <li key={chat.id}>
                    <div className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}>
                      <button className="chat-item-select" onClick={() => onSelectChat(chat.id)}>
                        <ChatIcon size={15} />
                        <span className="chat-item-title">{chat.title}</span>
                      </button>
                      <button
                        className="chat-item-delete"
                        onClick={() => onDeleteChat(chat.id)}
                        aria-label={`Delete chat "${chat.title}"`}
                      >
                        <TrashIcon size={14} />
                      </button>
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
