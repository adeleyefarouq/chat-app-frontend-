import React, { useState, useRef, useEffect } from "react";
import StarredMessagesView from "./StarredMessagesView";
import { api, resolveMediaUrl } from "../services/api";

const DEFAULT_PROFILE_AVATAR = "https://ui-avatars.com/api/?name=User&background=7c3aed&color=fff&rounded=true";
const DEFAULT_GROUP_AVATAR = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="24" fill="#e9d5ff"/>
    <path d="M30 34a10 10 0 1 1 20 0a10 10 0 0 1-20 0zm-12 30c3-10 12-15 22-15s19 5 22 15" fill="#7c3aed" opacity="0.9"/>
    <path d="M50 34a10 10 0 1 1 20 0a10 10 0 0 1-20 0zm-11 28c2-8 8-12 15-12c2 0 4 0 6 1c3 1 6 3 8 6c1 2 2 4 3 6" fill="#a78bfa" opacity="0.95"/>
  </svg>
`)}`;
const EMOJIS = ["😀","😂","😍","🥰","😎","🤩","😊","🥳","👍","👏","🙌","🤝","❤️","🔥","⭐","✨","🎉","🎊","🎈","🎁","💯","🚀","💪","🙏","😅","🤔","😮","😱","🤣","😭","🥺","😤"];

function buildAvatar(name, fallback = DEFAULT_PROFILE_AVATAR) {
  if (!name) return fallback;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&rounded=true`;
}

/* ── Icons ── */
const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
  </svg>
);
const EmojiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);
const AttachIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ReplyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 14 4 9 9 4"/>
    <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
  </svg>
);
const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon fill="none" stroke="currentColor" strokeWidth="2.5" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const StarFilledIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

/* ── Date Separator ── */
function DateSeparator({ label }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium px-2">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

/* ── Meeting Invite Card ── */
function MeetingInviteCard({ data }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 max-w-[340px] min-w-[280px]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center shrink-0 shadow-md shadow-purple-200">
          <PlayIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm leading-tight">{data.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{data.subtitle}</p>
        </div>
        <div className="flex -space-x-2 shrink-0">
          {(data.participants || []).slice(0, 3).map((key, i) => (
            <img
              key={i}
              src={resolveMediaUrl(buildAvatar(key))}
              alt=""
              className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm"
            />
          ))}
          {data.extraCount > 0 && (
            <div className="w-7 h-7 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center shadow-sm">
              <span className="text-[9px] font-bold text-purple-600">+{data.extraCount}</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 mb-3" />

      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-gray-400"><LinkIcon /></span>
        <span className="text-xs text-gray-400 truncate">{data.link}</span>
      </div>

      <button className="join-btn w-full py-2.5 rounded-xl text-white text-sm font-bold tracking-wide">
        Join
      </button>
    </div>
  );
}

/* ── Message Bubble ── */
function MessageBubble({ msg, showSenderName = false, onStarMessage, onDeleteMessage, onOpenImage }) {
  const isSent = msg.type === "sent";
  const isStarred = msg.isStarred || false;

  return (
    <div className={`flex items-end gap-2.5 mb-4 ${isSent ? "flex-row-reverse" : "flex-row"}`}>
      {!isSent ? (
        <img
          src={resolveMediaUrl(msg.senderAvatar || buildAvatar(msg.sender))}
          alt={msg.sender}
          className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
          style={{ alignSelf: "flex-end", marginBottom: msg.reactions?.length ? "22px" : "2px" }}
        />
      ) : (
        <img
          src={resolveMediaUrl(buildAvatar("Me"))}
          alt="Me"
          className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
          style={{ alignSelf: "flex-end", marginBottom: msg.reactions?.length ? "22px" : "2px" }}
        />
      )}

      <div className={`flex flex-col ${isSent ? "items-end" : "items-start"} max-w-[72%] xl:max-w-[65%]`}>
        {showSenderName && !isSent && (
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <span className="text-xs font-semibold text-gray-700">{msg.sender}</span>
            <span className="text-[10px] text-gray-400">{msg.time}</span>
          </div>
        )}

        <div className="relative group">
          {msg.contentType === "meeting-invite" ? (
            <MeetingInviteCard data={msg.meetingData} />
          ) : msg.contentType === "text" ? (
            <div
              className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                isSent
                  ? "bg-linear-to-br from-violet-600 to-purple-700 text-white rounded-br-md shadow-md shadow-purple-200/60"
                  : "bg-sky-50 text-slate-800 rounded-bl-md shadow-sm border border-sky-100"
              }`}
            >
              {msg.content}
            </div>
          ) : msg.contentType === "text-image" ? (
            <div
              className={`rounded-2xl overflow-hidden text-sm leading-relaxed shadow-md ${
                isSent ? "rounded-br-md bg-linear-to-br from-violet-600 to-purple-700 text-white" : "rounded-bl-md bg-sky-50 text-slate-800 border border-sky-100"
              }`}
              style={{ maxWidth: "300px" }}
            >
              <p className="px-4 pt-3.5 pb-2.5 leading-relaxed">{msg.content}</p>
              <img
                src={resolveMediaUrl(msg.imageUrl)}
                alt="attachment"
                className="w-full cursor-pointer object-cover"
                style={{ maxHeight: "180px" }}
                onClick={() => onOpenImage?.(msg.imageUrl)}
              />
            </div>
          ) : msg.contentType === "image" ? (
            <div className="rounded-2xl overflow-hidden shadow-md">
              <img
                src={resolveMediaUrl(msg.imageUrl)}
                alt="attachment"
                className="cursor-pointer rounded-2xl object-cover"
                style={{ maxWidth: "260px", maxHeight: "200px" }}
                onClick={() => onOpenImage?.(msg.imageUrl)}
              />
            </div>
          ) : null}

          {(msg.contentType === "text" || msg.contentType === "text-image" || msg.contentType === "image") && (
            <div
              className={`message-actions absolute top-1/2 -translate-y-1/2 flex gap-1 ${
                isSent ? "right-full mr-2" : "left-full ml-2"
              }`}
            >
              <button className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 shadow-sm transition-colors">
                <ReplyIcon />
              </button>
              {onStarMessage && (
                <button
                  onClick={() => onStarMessage(msg.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-colors border ${
                    isStarred
                      ? "bg-yellow-50 border-yellow-300 text-yellow-500 hover:bg-yellow-100"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                  title={isStarred ? "Unstar message" : "Star message"}
                >
                  {isStarred ? <StarFilledIcon /> : <StarIcon />}
                </button>
              )}
              {isSent && onDeleteMessage && (
                <button
                  type="button"
                  onClick={() => onDeleteMessage(msg.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-red-200 bg-white text-sm font-bold text-red-500 shadow-sm transition-colors hover:bg-red-50"
                  title="Delete message"
                  aria-label="Delete message"
                >
                  &times;
                </button>
              )}
            </div>
          )}
        </div>

        {isSent && (
          <div className="flex items-center gap-1.5 mt-1 px-1">
            <span className="text-[10px] text-gray-400">{msg.time}</span>
            <svg width="14" height="10" viewBox="0 0 16 12" fill="none">
              <path d="M1 6l4 4 9-9" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 6l4 4 9-9" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform="translate(2, 0)"/>
            </svg>
          </div>
        )}

        {msg.reactions && msg.reactions.length > 0 && (
          <div className={`flex gap-1 mt-1.5 ${isSent ? "justify-end" : "justify-start"}`}>
            {msg.reactions.map((r, i) => (
              <button
                key={i}
                className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-full px-2 py-0.5 text-sm shadow-sm hover:bg-purple-50 hover:border-purple-200 transition-colors"
              >
                <span>{r.emoji}</span>
                {r.count > 1 && <span className="text-gray-500 text-[10px] font-semibold">{r.count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Typing Indicator ── */
function TypingIndicator({ name = "User" }) {
  return (
    <div className="flex items-end gap-2.5 mb-2">
      <img
        src={buildAvatar(name)}
        alt={name}
        className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
        style={{ marginBottom: "2px" }}
      />
      <div className="flex items-center gap-3 bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
        <div className="flex gap-1.5 items-center">
          <div className="w-2 h-2 rounded-full bg-purple-300" />
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <div className="w-2 h-2 rounded-full bg-purple-500" />
        </div>
        <span className="text-xs text-gray-500">
          <span className="font-semibold text-purple-600">{name}</span> is typing...
        </span>
      </div>
    </div>
  );
}

/* ── Emoji Picker ── */
function EmojiPicker({ onSelect, onClose }) {
  return (
    <div className="emoji-picker-enter absolute bottom-full mb-3 left-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 w-[288px]">
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Emoji</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
      </div>
      <div className="grid grid-cols-8 gap-0.5">
        {EMOJIS.map((emoji, i) => (
          <button
            key={i}
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-purple-50 hover:scale-110 transition-all cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main Chat Area ── */
export default function ChatArea({ 
  onOpenDetails, 
  onOpenProfile, 
  activeChat, 
  messages, 
  onSendMessage, 
  currentUser, 
  activeNav = "chat", 
  activeNavLabel = "Chats", 
  isTyping = false,
  starredMessages = [],
  onStarMessage,
  onDeleteMessage,
  onUnstarMessage,
  onJumpToChat,
  onToggleNotifications,
  onToggleMuteChat,
  onHideChat,
}) {
  const [inputText, setInputText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const messagesEndRef = useRef(null);
  const shouldShowTyping = Boolean(activeChat?.isOnline && isTyping);
  const fileInputRef = useRef(null);
  const emojiRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const isNavView = activeNav !== "chat";

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

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return undefined;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (transcript) {
        setInputText(transcript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setVoiceError("Voice input is unavailable right now.");
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    onSendMessage(text);
    setInputText("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInputText((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setVoiceError("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setVoiceError("");
    recognitionRef.current.start();
    setIsListening(true);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;
    
    try {
      console.log('[ChatArea] uploading image:', { name: file.name, size: file.size });
      const uploadResponse = await api.chats.uploadImage(activeChat, file);
      const imageUrl = uploadResponse.imageUrl;
      console.log('[ChatArea] image uploaded:', imageUrl);
      
      // Send the message with the image URL
      await onSendMessage?.(imageUrl, { contentType: 'image' });
    } catch (error) {
      console.error('[ChatArea] image upload failed:', error);
    }
    e.target.value = "";
  };

  return (
    <div className="flex flex-col flex-1 h-full min-w-0" style={{ background: "#f8f7ff" }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-gray-100 shrink-0"
           style={{ boxShadow: "0 1px 0 #f0f0f5" }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenProfile}
            className="relative cursor-pointer rounded-full border-0 bg-transparent p-0"
          >
            <img
              src={resolveMediaUrl(activeChat?.isGroup ? DEFAULT_GROUP_AVATAR : (activeChat?.avatar || DEFAULT_PROFILE_AVATAR))}
              alt={activeChat?.name || "Chat user"}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </button>
          <div>
            <h2 className="font-bold text-gray-800 text-sm leading-tight">{isNavView ? activeNavLabel : activeChat?.name || "Select a conversation"}</h2>
            <p className="text-xs text-green-500 font-semibold">{isNavView ? "Workspace view" : activeChat ? (activeChat?.isOnline ? "Online" : "Offline") : "No conversation selected"}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MoreIcon />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-11 z-20 w-44 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
              <button
                type="button"
                onClick={() => { onToggleMuteChat?.(activeChat?.id); setShowMenu(false); }}
                className="w-full rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-slate-50"
              >
                {activeChat?.muted ? "Unmute chat" : "Mute chat"}
              </button>
              <button
                type="button"
                onClick={() => { onHideChat?.(activeChat?.id); setShowMenu(false); }}
                className="w-full rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-slate-50"
              >
                Delete conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 xl:px-8 py-5">
        {activeNav === "starred" ? (
          <StarredMessagesView
            starredMessages={starredMessages}
            onJumpToChat={onJumpToChat}
            onUnstar={onUnstarMessage}
            currentUser={currentUser}
          />
        ) : activeNav === "settings" ? (
          <div className="flex h-full min-h-[260px] items-center justify-center">
            <div className="w-full max-w-2xl rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-purple-600">{activeNavLabel}</p>
              <h3 className="mt-2 text-lg font-bold text-gray-800">Notification settings</h3>
              <p className="mt-2 text-sm text-gray-500">Keep your preferences here for a quick deadline-safe update.</p>
              <div className="mt-6 rounded-2xl border border-gray-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-800">Message notifications</div>
                    <div className="text-xs text-gray-500">Turn push-style in-app alerts on or off.</div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleNotifications}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${currentUser?.notificationsEnabled === false ? "bg-gray-300" : "bg-purple-600"}`}
                    aria-label="Toggle notifications"
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${currentUser?.notificationsEnabled === false ? "translate-x-1" : "translate-x-6"}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeNav === "groups" ? (
          <div className="flex h-full min-h-[260px] items-center justify-center">
            <div className="max-w-md rounded-3xl border border-purple-100 bg-white p-6 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-purple-600">{activeNavLabel}</p>
              <h3 className="mt-2 text-lg font-bold text-gray-800">{activeNavLabel} workspace</h3>
              <p className="mt-2 text-sm text-gray-500">Select a group conversation from the sidebar to start messaging here.</p>
            </div>
          </div>
        ) : isNavView ? (
          <div className="flex h-full min-h-[260px] items-center justify-center">
            <div className="max-w-md rounded-3xl border border-purple-100 bg-white p-6 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-purple-600">{activeNavLabel}</p>
              <h3 className="mt-2 text-lg font-bold text-gray-800">{activeNavLabel} workspace</h3>
              <p className="mt-2 text-sm text-gray-500">Select a conversation from the sidebar to start messaging here.</p>
            </div>
          </div>
        ) : (
          <>
            <DateSeparator label="Today" />
            {(messages || []).map((msg) => (
              <MessageBubble 
                key={msg.id} 
                msg={msg} 
                showSenderName={Boolean(activeChat?.isGroup)}
                onStarMessage={onStarMessage}
                onDeleteMessage={onDeleteMessage}
                onOpenImage={setPreviewImage}
              />
            ))}
            {shouldShowTyping && <TypingIndicator name={activeChat?.name || "User"} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ── Input Dock ── */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Plus / Add */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors shrink-0"
            title="Add attachment"
          >
            <PlusIcon />
          </button>

          {/* Input Container */}
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-100 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 min-w-0"
            />

            <div className="flex items-center gap-0.5 shrink-0">
              {/* Emoji Picker Trigger */}
              <div className="relative" ref={emojiRef}>
                <button
                  onClick={() => setShowEmoji((v) => !v)}
                  title="Emoji"
                  className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                    showEmoji
                      ? "text-purple-600 bg-purple-100"
                      : "text-gray-400 hover:text-purple-500 hover:bg-purple-50"
                  }`}
                >
                  <EmojiIcon />
                </button>
                {showEmoji && (
                  <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
                )}
              </div>

              {/* Attach */}
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Attach image"
                className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-purple-500 hover:bg-purple-50 transition-all"
              >
                <AttachIcon />
              </button>

              {/* Mic */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                title={isListening ? "Stop voice input" : "Voice message"}
                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                  isListening ? "text-purple-600 bg-purple-100" : "text-gray-400 hover:text-purple-500 hover:bg-purple-50"
                }`}
              >
                <MicIcon />
              </button>
            </div>
            {voiceError && <p className="mt-2 text-[11px] text-red-500">{voiceError}</p>}
          </div>

          {/* Send Button */}
          <button
            onClick={sendMessage}
            className="send-btn w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            title="Send message"
          >
            <SendIcon />
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
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
