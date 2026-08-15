import React, { useState } from "react";
import { resolveMediaUrl } from "../services/api";

const DEFAULT_PROFILE_AVATAR = "https://ui-avatars.com/api/?name=User&background=7c3aed&color=fff&rounded=true";

function buildAvatar(name, fallback = DEFAULT_PROFILE_AVATAR) {
  if (!name) return fallback;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&rounded=true`;
}

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default function StarredMessagesView({ starredMessages = [], onJumpToChat, onUnstar, currentUser }) {
  const [unstarring, setUnstarring] = useState(null);

  const handleUnstar = async (messageId, chatId) => {
    setUnstarring(messageId);
    try {
      await onUnstar(chatId, messageId);
    } finally {
      setUnstarring(null);
    }
  };

  if (!starredMessages || starredMessages.length === 0) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-slate-50/50 p-6">
        <div className="text-center">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-gray-300">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Starred Messages</h3>
          <p className="text-sm text-gray-500">Star messages to save them for later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-50/50 overflow-hidden">
      {/* Header */}
      <div className="h-20 border-b border-gray-100 bg-white px-6 flex items-center justify-between shrink-0">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-purple-600">Messages</p>
          <h2 className="font-bold text-gray-800 text-sm leading-tight mt-1">Starred Messages ({starredMessages.length})</h2>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {starredMessages.map((message) => (
            <div
              key={message.id}
              className="bg-white hover:bg-slate-50 transition-colors border-b border-gray-100 p-4 group"
            >
              <div className="flex items-start gap-3">
                {/* Sender Avatar */}
                <img
                  src={resolveMediaUrl(message.senderAvatar || buildAvatar(message.sender))}
                  alt={message.sender}
                  className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
                />

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-800">{message.sender}</span>
                      <span className="text-xs text-gray-400">{message.createdAt}</span>
                    </div>
                  </div>

                  {/* Chat Reference */}
                  <div className="text-xs text-gray-500 mb-2">in {message.chatName || "Unknown Chat"}</div>

                  {/* Message Preview */}
                  <p className="text-sm text-gray-700 truncate mb-3">{message.content}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onJumpToChat(message.chatId, message.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors flex items-center gap-1 font-medium"
                    >
                      Open Chat
                      <ChevronRightIcon />
                    </button>

                    <button
                      onClick={() => handleUnstar(message.id, message.chatId)}
                      disabled={unstarring === message.id}
                      className="text-xs px-2 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Unstar message"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
