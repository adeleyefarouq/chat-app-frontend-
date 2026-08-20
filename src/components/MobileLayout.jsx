import React, { useState, useRef, useEffect } from "react";
import { resolveMediaUrl } from "../services/api";
import RightPanel from "./RightPanel";

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

function MobileMessageBubble({ msg, currentUser, onOpenImage, onDeleteMessage }) {
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
            <img
              src={resolveMediaUrl(msg.imageUrl)}
              alt="attachment"
              className="max-h-40 max-w-[200px] cursor-pointer rounded-2xl object-cover"
              onClick={() => onOpenImage?.(msg.imageUrl)}
            />
          ) : null}
        </div>
        {isSent && (
          <div className="mt-0.5 flex items-center gap-2 px-1">
            <span className="text-[9px] text-gray-400">{msg.time}</span>
            {onDeleteMessage && (
              <button
                type="button"
                onClick={() => onDeleteMessage(msg.id)}
                className="text-[10px] font-semibold text-red-500"
                aria-label="Delete message"
              >
                Delete
              </button>
            )}
          </div>
        )}
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

function MobileChatView({ onBack, activeChat, messages, onSendMessage, onDeleteMessage, currentUser }) {
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
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
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-gray-50">
      <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-3 py-3 shadow-sm shrink-0">
        <button onClick={onBack} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100">
          <BackIcon />
        </button>
        <div className="relative shrink-0">
          <img
            src={resolveMediaUrl(activeChat?.isGroup ? DEFAULT_GROUP_AVATAR : (activeChat?.avatar || buildAvatar(activeChat?.name || "User")))}
            alt={activeChat?.name || "Chat user"}
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold leading-tight text-gray-800">{activeChat?.name || "Select a conversation"}</p>
          <p className="text-[11px] font-medium text-green-500">{activeChat?.isOnline ? "Online" : "Offline"}</p>
        </div>
        <button className="flex h-8 w-8 shrink-0 items-center justify-center text-gray-400 transition-colors hover:text-gray-600">
          <MoreIcon />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
        {(messages || []).map((msg) => <MobileMessageBubble key={msg.id} msg={msg} currentUser={currentUser} onOpenImage={setPreviewImage} onDeleteMessage={onDeleteMessage} />)}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative border-t border-gray-100 bg-white px-2.5 py-2.5">
        <div className="flex items-center gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="flex h-8 w-8 shrink-0 items-center justify-center text-gray-400 transition-colors hover:text-purple-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <div className="relative flex min-w-0 flex-1 items-center gap-1.5 rounded-2xl border border-gray-100 bg-gray-50 px-2.5 py-2">
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
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
            <div className="flex shrink-0 items-center gap-1" ref={emojiRef}>
              <button onClick={() => setShowEmoji((v) => !v)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600">
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
            <button onClick={() => fileInputRef.current?.click()} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600">
              <AttachIcon />
            </button>
            <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600">
              <MicIcon />
            </button>
          </div>
          <button onClick={sendMessage} className="send-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
            <SendIcon />
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            aria-label="Close image preview"
            className="absolute right-5 top-5 rounded-full bg-white px-3 py-1 text-2xl leading-none text-gray-700 shadow-lg"
            onClick={() => setPreviewImage(null)}
          >
            &times;
          </button>
          <img
            src={resolveMediaUrl(previewImage)}
            alt="Full-size attachment"
            className="max-h-full max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function MobileChatList({ chats = [], onSelectChat, onFindUser, activeTab, searchResults = [], searchLoading = false }) {
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

  // When user has typed in search and we have search results, display those
  const displayList = search.trim() ? searchResults : filteredChats;
  const noResultsMessage = search.trim() ? "No users found" : "No chats found";
  const getChatPreview = (chat) => chat.lastMessageContentType === "image" || chat.lastMessageType === "image"
    ? "📷 Photo"
    : chat.lastMessage;

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between bg-white px-4 pb-3 pt-5">
        <div className="flex items-center gap-2">
          <AWLogo />
          <span className="text-lg font-bold text-gray-800">Chats</span>
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100">
          <SearchIcon />
        </button>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
          <span className="shrink-0 text-gray-400"><SearchIcon /></span>
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
            className="min-w-0 flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {!search.trim() && (
        <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`filter-chip shrink-0 rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${
                activeFilter === f ? "active" : ""
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {searchLoading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">Searching...</div>
        ) : displayList.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectChat(item.id)}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <div className="relative shrink-0">
              <img src={resolveMediaUrl(item.isGroup ? DEFAULT_GROUP_AVATAR : (item.avatar || buildAvatar(item.name || item.username)))} alt={item.name || item.username} className="h-12 w-12 rounded-full object-cover" />
              {item.isOnline && (
                <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-gray-800">{item.name || item.username}</span>
                {item.time && <span className="shrink-0 text-[11px] text-gray-400">{item.time}</span>}
              </div>
              {item.lastMessage && <p className="mt-0.5 truncate text-xs text-gray-500">{getChatPreview(item)}</p>}
            </div>
          </div>
        ))}
        {!searchLoading && displayList.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">{noResultsMessage}</div>
        )}
      </div>
    </div>
  );
}

export default function MobileLayout({ currentUser, chats, activeChat, setActiveChat, activeNav, messages, onSendMessage, onDeleteMessage, onFindUser, onOpenMyProfile, onUpdateProfile, searchResults = [], searchLoading = false }) {
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

  const handleProfileOpen = () => {
    setActiveTab("profile");
    setView("profile");
    onOpenMyProfile?.();
  };

  const showBottomNav = view !== "chat" && view !== "profile";

  const tabs = [
    { id: "chat", icon: <ChatIcon />, label: "Chats" },
    { id: "groups", icon: <GroupIcon />, label: "Groups" },
    { id: "add", icon: <AddIcon2 />, label: "Add" },
    { id: "starred", icon: <StarIcon2 />, label: "Starred" },
    { id: "profile", icon: <ProfileIcon />, label: "Profile" },
  ];

  const activeChatData = chats.find((chat) => chat.id === activeChat) || null;

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-white">
      <div className="flex-1 min-h-0 overflow-hidden">
        {view === "profile" ? (
          <div className="h-full w-full overflow-y-auto bg-white [&>div]:w-full! [&>div]:shrink-0">
            <RightPanel
              onClose={() => {
                setView("list");
                setActiveTab("chat");
              }}
              profile={currentUser}
              profileMode="me"
              onUpdateProfile={(updatedUser) => {
                if (updatedUser) onUpdateProfile?.(updatedUser);
              }}
            />
          </div>
        ) : view === "list" ? (
          <MobileChatList
            chats={chats}
            onSelectChat={(chatId) => {
              setActiveTab("chat");
              setActiveChat(chatId);
              setView("chat");
            }}
            onFindUser={onFindUser}
            activeTab={activeTab}
            searchResults={searchResults}
            searchLoading={searchLoading}
          />
        ) : (
          <MobileChatView
            onBack={() => {
              setView("list");
              setActiveTab("chat");
            }}
            activeChat={activeChatData}
            messages={messages}
            onSendMessage={onSendMessage}
            onDeleteMessage={onDeleteMessage}
            currentUser={currentUser}
          />
        )}
      </div>

      {showBottomNav && (
        <div className="flex shrink-0 items-center border-t border-gray-100 bg-white px-2 py-1 shadow-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "profile") {
                  handleProfileOpen();
                  return;
                }
                setActiveTab(tab.id);
                if (tab.id === "chat" || tab.id === "groups") setView("list");
              }}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors ${
                activeTab === tab.id ? "text-purple-600" : "text-gray-400"
              }`}
            >
              <span className={`rounded-xl p-1.5 transition-colors ${activeTab === tab.id ? "bg-purple-50" : ""}`}>
                {tab.icon}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
