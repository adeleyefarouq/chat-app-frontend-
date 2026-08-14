import React, { useState, useRef, useEffect } from "react";
import { resolveMediaUrl } from "../services/api";

const DEFAULT_PROFILE_AVATAR = "http://localhost:5000/uploads/avatars/default-avatar.svg";
const DEFAULT_GROUP_AVATAR = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="24" fill="#e9d5ff"/>
    <path d="M30 34a10 10 0 1 1 20 0a10 10 0 0 1-20 0zm-12 30c3-10 12-15 22-15s19 5 22 15" fill="#7c3aed" opacity="0.9"/>
    <path d="M50 34a10 10 0 1 1 20 0a10 10 0 0 1-20 0zm-11 28c2-8 8-12 15-12c2 0 4 0 6 1c3 1 6 3 8 6c1 2 2 4 3 6" fill="#a78bfa" opacity="0.95"/>
  </svg>
`)}`;

function buildAvatar(name, fallback = DEFAULT_PROFILE_AVATAR) {
  if (!name) return fallback;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&rounded=true`;
}

/* ── Icons ── */
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
  </svg>
);
const GroupIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);
const AddIcon2 = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);
const StarIcon2 = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);
const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);
const BackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
  </svg>
);
const EmojiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);
const AttachIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);
const AWLogo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#7c3aed"/>
    <path d="M6 22 L12 10 L16 18 L20 10 L26 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const EMOJIS = ["😀","😂","😍","🥰","😎","🤩","😊","🥳","👍","👏","🙌","🤝","❤️","🔥","⭐","✨","🎉","🎊","🎈","🎁","💯","🚀","💪","🙏","😅","🤔","😮","😱","🤣","😭","🥺","😤"];

function MobileMessageBubble({ msg, currentUser }) {
  const isSent = msg.type === "sent";
  const senderAvatar = msg.senderAvatar || buildAvatar(msg.sender || "User");

  return (
    <div className={`flex items-end gap-2 mb-3 ${isSent ? "flex-row-reverse" : "flex-row"}`}>
      {!isSent && (
        <img src={resolveMediaUrl(senderAvatar)} alt={msg.sender} className="w-7 h-7 rounded-full object-cover shrink-0" />
      )}
      <div className={`flex flex-col ${isSent ? "items-end" : "items-start"} max-w-[80%]`}>
        {!isSent && (
          <div className="flex items-center gap-1.5 mb-0.5 px-1">
            <span className="text-[11px] font-semibold text-gray-700">{msg.sender}</span>
            <span className="text-[9px] text-gray-400">{msg.time}</span>
          </div>
        )}
        <div className="relative">
          {msg.contentType === "text" ? (
            <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isSent ? "bg-purple-600 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
            }`}>
              {msg.content}
            </div>
          ) : msg.contentType === "image" ? (
            <img src={resolveMediaUrl(msg.imageUrl)} alt="attachment" className="max-w-[200px] max-h-40 object-cover rounded-2xl" />
          ) : null}
        </div>
        {isSent && <span className="text-[9px] text-gray-400 mt-0.5 px-1">{msg.time}</span>}
      </div>
      {isSent && (
        <img src={resolveMediaUrl(currentUser?.avatar || buildAvatar(currentUser?.name || currentUser?.username || "Me"))} alt="Me" className="w-7 h-7 rounded-full object-cover shrink-0" />
      )}
    </div>
  );
}

function MobileEmojiPicker({ onSelect }) {
  return (
    <div className="emoji-picker-enter absolute bottom-full mb-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50">
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.map((emoji, i) => (
          <button
            key={i}
            onClick={() => onSelect(emoji)}
            className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-purple-50 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

function MobileChatView({ onBack, activeChat, messages, onSendMessage, currentUser }) {
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    function handleClick(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    onSendMessage?.(text);
    setInputText("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newMsg = {
      id: `m-${Date.now()}`,
      type: "sent",
      sender: currentUser?.name || "Me",
      senderAvatar: currentUser?.avatar || buildAvatar(currentUser?.name || currentUser?.username || "Me"),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content: null,
      contentType: "image",
      imageUrl: url,
      reactions: [],
    };
    onSendMessage?.(null, newMsg);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shrink-0 shadow-sm">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
          <BackIcon />
        </button>
        <div className="relative">
          <img
            src={resolveMediaUrl(activeChat?.isGroup ? DEFAULT_GROUP_AVATAR : (activeChat?.avatar || buildAvatar(activeChat?.name || "User")))}
            alt={activeChat?.name || "Chat user"}
            className="w-9 h-9 rounded-full object-cover"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800 text-sm leading-tight">{activeChat?.name || "Select a conversation"}</p>
          <p className="text-xs text-green-500 font-medium">{activeChat?.isOnline ? "Online" : "Offline"}</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3">
        {(messages || []).map((msg) => <MobileMessageBubble key={msg.id} msg={msg} currentUser={currentUser} />)}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-100 px-3 py-2.5 relative">
        <div className="flex items-center gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-purple-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <div className="flex-1 flex items-center gap-1.5 bg-gray-50 rounded-2xl px-3 py-2 border border-gray-100 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
            />
            <div className="flex items-center gap-1" ref={emojiRef}>
              <button onClick={() => setShowEmoji((v) => !v)} className="text-gray-400 hover:text-purple-600 transition-colors w-7 h-7 flex items-center justify-center rounded-lg">
                <EmojiIcon />
              </button>
              {showEmoji && (
                <div className="absolute bottom-full left-0 right-0 mb-2 px-2">
                  <MobileEmojiPicker onSelect={(emoji) => {
                    setInputText((prev) => prev + emoji);
                    setShowEmoji(false);
                  }} />
                </div>
              )}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-purple-600 transition-colors w-7 h-7 flex items-center justify-center rounded-lg">
              <AttachIcon />
            </button>
            <button className="text-gray-400 hover:text-purple-600 transition-colors w-7 h-7 flex items-center justify-center rounded-lg">
              <MicIcon />
            </button>
          </div>
          <button onClick={sendMessage} className="send-btn w-10 h-10 rounded-2xl flex items-center justify-center shrink-0">
            <SendIcon />
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      </div>
    </div>
  );
}

function MobileChatList({ chats = [], onSelectChat, onFindUser, activeTab }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filters = ["All", "Unread", "Groups", "Mentions"];

  const filteredChats = chats.filter((chat) => {
    const haystack = `${chat.name} ${chat.username || ""}`.toLowerCase();
    if (search) return haystack.includes(search.toLowerCase());
    if (activeTab === "groups" || activeFilter === "Groups") return chat.isGroup;
    if (activeFilter === "Unread") return chat.unread > 0;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 pt-5 pb-3 bg-white">
        <div className="flex items-center gap-2">
          <AWLogo />
          <span className="font-bold text-gray-800 text-lg">Chats</span>
        </div>
        <button className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
          <SearchIcon />
        </button>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
          <span className="text-gray-400 shrink-0"><SearchIcon /></span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onFindUser?.(search);
              }
            }}
            placeholder="Search or start a new chat"
            className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder-gray-400 min-w-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`filter-chip text-xs font-semibold px-3 py-1.5 rounded-full border-0 outline-none shrink-0 ${
              activeFilter === f ? "active" : ""
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="relative shrink-0">
              <img src={resolveMediaUrl(chat.avatar || buildAvatar(chat.name))} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
              {chat.isOnline && (
                <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-sm">{chat.name}</span>
                <span className="text-[11px] text-gray-400">{chat.time}</span>
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
        {filteredChats.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">No chats found</div>
        )}
      </div>
    </div>
  );
}

export default function MobileLayout({ currentUser, chats, activeChat, setActiveChat, activeNav, messages, onSendMessage, onFindUser }) {
  const [view, setView] = useState("list");
  const [activeTab, setActiveTab] = useState(activeNav === "groups" ? "groups" : "chat");

  useEffect(() => {
    if (activeNav === "groups") {
      setActiveTab("groups");
      setView("list");
    } else if (activeNav === "chat") {
      setActiveTab("chat");
      setView("list");
    }
  }, [activeNav]);

  const tabs = [
    { id: "chat", icon: <ChatIcon />, label: "Chats" },
    { id: "groups", icon: <GroupIcon />, label: "Groups" },
    { id: "add", icon: <AddIcon2 />, label: "Add" },
    { id: "starred", icon: <StarIcon2 />, label: "Starred" },
    { id: "profile", icon: <ProfileIcon />, label: "Profile" },
  ];

  const activeChatData = chats.find((chat) => chat.id === activeChat) || null;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-hidden">
        {view === "list" ? (
          <MobileChatList
            chats={chats}
            onSelectChat={(chatId) => { setActiveChat(chatId); setView("chat"); }}
            onFindUser={onFindUser}
            activeTab={activeTab}
          />
        ) : (
          <MobileChatView
            onBack={() => setView("list")}
            activeChat={activeChatData}
            messages={messages}
            onSendMessage={onSendMessage}
            currentUser={currentUser}
          />
        )}
      </div>

      <div className="flex items-center bg-white border-t border-gray-100 px-2 py-1 safe-area-inset-bottom shrink-0 shadow-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "chat" || tab.id === "groups") setView("list");
            }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors ${
              activeTab === tab.id ? "text-purple-600" : "text-gray-400"
            }`}
          >
            <span className={`p-1.5 rounded-xl transition-colors ${activeTab === tab.id ? "bg-purple-50" : ""}`}>
              {tab.icon}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
