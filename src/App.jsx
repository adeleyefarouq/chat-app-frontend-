import React, { useState, useEffect, useRef } from "react";
import NavigationRail from "./components/NavigationRail";
import ChatListSidebar from "./components/ChatListSidebar";
import ChatArea from "./components/ChatArea";
import RightPanel from "./components/RightPanel";
import MobileLayout from "./components/MobileLayout";
import AuthScreen from "./components/AuthScreen";
import { useAuth } from "./context/AuthContext";
import { api } from "./services/api";
import { createSocket } from "./services/socket";

const DEFAULT_CHAT_AVATAR = "https://ui-avatars.com/api/?name=User&background=7c3aed&color=fff&rounded=true";
const DEFAULT_GROUP_AVATAR = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="24" fill="#e9d5ff"/>
    <path d="M30 34a10 10 0 1 1 20 0a10 10 0 0 1-20 0zm-12 30c3-10 12-15 22-15s19 5 22 15" fill="#7c3aed" opacity="0.9"/>
    <path d="M50 34a10 10 0 1 1 20 0a10 10 0 0 1-20 0zm-11 28c2-8 8-12 15-12c2 0 4 0 6 1c3 1 6 3 8 6c1 2 2 4 3 6" fill="#a78bfa" opacity="0.95"/>
  </svg>
`)}`;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

function buildAvatar(name, fallback = DEFAULT_CHAT_AVATAR) {
  if (!name) return fallback;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&rounded=true`;
}

function normalizeChat(item) {
  const participant = item.user || item.participant || item.contact || {};
  const participants = Array.isArray(item.participants) ? item.participants : [];
  const participantNames = participants
    .map((entry) => entry?.name || entry?.username)
    .filter(Boolean);
  const isGroup = Boolean(item.isGroup || item.groupId || participants.length > 1);
  const name = item.name || item.groupName || participantNames.join(", ") || participant.name || participant.username || item.username || "Unknown User";
  const username = item.username || participant.username || participantNames[0] || "";
  const avatar = isGroup ? DEFAULT_GROUP_AVATAR : (item.avatar || participant.avatar || buildAvatar(name));
  const lastMessageContentType = item.lastMessageContentType || item.lastMessageType || "text";

  return {
    id: item.id || item._id || participant.id || username,
    name,
    username,
    avatar,
    lastMessage: lastMessageContentType === "image"
      ? "📷 Photo"
      : (item.lastMessage || item.preview || item.message || (isGroup ? "Group conversation" : "Start a conversation")),
    lastMessageContentType,
    unread: item.unread || 0,
    isOnline: item.isOnline ?? participant.isOnline ?? true,
    isGroup,
    muted: Array.isArray(item.mutedBy) ? item.mutedBy.some((id) => String(id) === String(item.currentUserId || "")) : false,
    avatars: item.avatars || [avatar, DEFAULT_CHAT_AVATAR],
  };
}

function normalizeMessages(items = [], currentUser) {
  return items.map((item) => {
    const message = item?.message && typeof item.message === "object" ? item.message : item;
    const sender = typeof message.sender === "string" ? { username: message.sender, name: message.sender } : message.sender || message.user || {};
    const isSent = currentUser && (sender.id === currentUser.id || sender.username === currentUser.username);
    const senderName = sender.name || sender.username || message.senderName || "Unknown";
    const starredBy = Array.isArray(message.starredBy) ? message.starredBy : [];
    const isStarred = starredBy.some((id) => id === currentUser?.id || id === currentUser?._id);
    const contentType = message.contentType || (message.imageUrl ? "image" : "text");
    return {
      id: message.id || message._id || `${message.createdAt || Date.now()}-${senderName}`,
      type: isSent ? "sent" : "received",
      sender: senderName,
      senderAvatar: message.senderAvatar || sender.avatar || buildAvatar(senderName),
      time: message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Now",
      content: message.content || message.text || message.message || "",
      contentType,
      imageUrl: contentType === "image" ? (message.imageUrl || message.content || null) : (message.imageUrl || null),
      reactions: message.reactions || [],
      isStarred,
    };
  });
}

function AppContent() {
  const isMobile = useIsMobile();
  const { user, loading, updateUser, logout } = useAuth();
  const [activeNav, setActiveNav] = useState("chat");
  const [activeChat, setActiveChat] = useState(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [starredMessages, setStarredMessages] = useState([]);
  const socketRef = useRef(null);
  const previousRoomRef = useRef(null);

  const handleLogout = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    previousRoomRef.current = null;
    setConversations([]);
    setMessages([]);
    setSearchQuery("");
    setSearchResults([]);
    setStarredMessages([]);
    setActiveChat(null);
    setShowRightPanel(false);
    setIsMyProfileOpen(false);
    logout();
  };

  const navLabels = {
    chat: "Chats",
    groups: "Groups",
    add: "New Chat",
    starred: "Starred",
    settings: "Settings",
  };

  const activeNavLabel = navLabels[activeNav] || "Chats";

  const appendMessage = (message) => {
    if (!message || !user) return;
    const normalized = normalizeMessages([message], user)[0];
    if (!normalized) return;
    setMessages((previous) => {
      if (previous.some((item) => item.id === normalized.id)) {
        return previous;
      }
      return [...previous, normalized];
    });
  };

  const updateChatPreview = (chatId, lastMessage, contentType = "text") => {
    setConversations((previous) => previous.map((chat) => (chat.id === chatId
      ? { ...chat, lastMessage: contentType === "image" ? "📷 Photo" : lastMessage, lastMessageContentType: contentType }
      : chat)));
  };

  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      try {
        const data = await api.chats.list();
        const chats = Array.isArray(data) ? data.map(normalizeChat) : (data?.chats || []).map(normalizeChat);
        setConversations(chats);
        if (!activeChat && chats[0]) {
          setActiveChat(chats[0].id);
        }
      } catch (error) {
        setConversations([]);
      }
    };

    const loadStarredMessages = async () => {
      try {
        const data = await api.messages.starred();
        const starred = Array.isArray(data) ? data : data?.messages || [];
        setStarredMessages(starred);
      } catch (error) {
        setStarredMessages([]);
      }
    };

    loadChats();
    loadStarredMessages();
  }, [user]);

  useEffect(() => {
    if (!activeChat || !user) return;

    const loadMessages = async () => {
      try {
        const data = await api.chats.messages(activeChat);
        const normalized = normalizeMessages(Array.isArray(data) ? data : data?.messages || [], user);
        setMessages(normalized);
      } catch (error) {
        setMessages([]);
      }
    };

    loadMessages();
  }, [activeChat, user]);

  useEffect(() => {
    if (!user) return;

    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connect error:", error);
    });

    console.log('listening for event: chat-message');
    socket.on("chat-message", (message) => {
      console.log('event fired: chat-message', message);
      if (!message?.roomId) return;
      appendMessage(message);
      updateChatPreview(message.roomId, message.content || message.text || "", message.contentType);
    });

    socket.on("message-deleted", ({ roomId, messageId, lastMessage, lastMessageType }) => {
      if (!roomId || !messageId) return;
      setMessages((previous) => previous.filter((message) => message.id !== messageId));
      updateChatPreview(roomId, lastMessage || "Start a conversation", lastMessageType || "text");
    });

    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("chat-message");
      socket.off("message-deleted");
      socket.disconnect();
      socketRef.current = null;
      previousRoomRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeChat) return;

    const previousRoom = previousRoomRef.current;
    if (previousRoom && previousRoom !== activeChat) {
      socket.emit("leave-room", previousRoom);
    }

    socket.emit("join-room", activeChat);
    previousRoomRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    const term = searchQuery.trim();
    if (!term) {
      setSearchResults([]);
      setSearchLoading(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const data = await api.users.search(term);
        const matches = Array.isArray(data?.users) ? data.users : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        const normalized = matches.map((entry) => ({
          ...entry,
          avatar: entry.avatar || buildAvatar(entry.name || entry.username || term),
        }));
        setSearchResults(normalized);
      } catch (error) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectingSearchResultRef = useRef(false);

  const openMyProfile = () => {
    setIsMyProfileOpen(true);
    setShowRightPanel(true);
  };

  const openPartnerProfile = () => {
    setIsMyProfileOpen(false);
    setShowRightPanel(true);
  };

  const handleSelectChat = (chatId) => {
    setActiveChat(chatId);
    setIsMyProfileOpen(false);
    setShowRightPanel(false);
  };

  const selectSearchResult = async (result) => {
    if (selectingSearchResultRef.current) {
      console.log('[selectSearchResult] ignored duplicate selection while in-flight');
      return;
    }

    selectingSearchResultRef.current = true;
    console.log('[selectSearchResult] full result object:', result);
    console.log('[selectSearchResult] result.id value:', result?.id);
    console.log('[selectSearchResult] result._id value:', result?._id);
    if (!result?.id) {
      selectingSearchResultRef.current = false;
      return;
    }

    const existingConversation = conversations.find((chat) => chat.id === result.id || chat.username === result.username);
    if (existingConversation) {
      setActiveChat(existingConversation.id);
      setSearchQuery("");
      setSearchResults([]);
      selectingSearchResultRef.current = false;
      return;
    }

    try {
      const payload = { participantId: result.id, username: result.username };
      console.log('[selectSearchResult] creating chat with payload:', JSON.stringify(payload));
      const created = await api.chats.create(payload);

      const nextChat = normalizeChat(created);
      setConversations((previous) => [nextChat, ...previous]);
      setActiveChat(nextChat.id);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      setSearchQuery("");
      setSearchResults([]);
    } finally {
      selectingSearchResultRef.current = false;
    }
  };

  const handleCreateGroup = async ({ participants, name }) => {
    const selectedParticipantIds = Array.isArray(participants) ? participants.filter(Boolean) : [];
    const trimmedName = String(name || "").trim();

    if (!trimmedName || selectedParticipantIds.length === 0) {
      return;
    }

    try {
      const payload = { participants: selectedParticipantIds, name: trimmedName };
      console.log('[handleCreateGroup] creating group with payload:', JSON.stringify(payload));
      const created = await api.chats.create(payload);

      const nextChat = normalizeChat(created);
      setConversations((previous) => [nextChat, ...previous]);
      setActiveChat(nextChat.id);
      setSearchQuery("");
      setSearchResults([]);
      return nextChat;
    } catch (error) {
      setSearchQuery("");
      setSearchResults([]);
      throw error;
    }
  };

  const startConversationByUsername = async (query) => {
    const trimmed = query?.trim();
    if (!trimmed) return;

    const requested = trimmed
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    try {
      if (requested.length > 1) {
        const matches = await Promise.all(
          requested.map(async (username) => {
            const result = await api.users.search(username);
            const foundUser = result?.users?.[0] || result?.data?.[0] || result;
            return foundUser || null;
          }),
        );

        const foundUsers = matches.filter(Boolean);
        if (foundUsers.length < 2) {
          setSearchQuery("");
          return;
        }

        const created = await api.chats.create({
          isGroup: true,
          name: foundUsers.map((entry) => entry.username || entry.name).join(", "),
          participantIds: foundUsers.map((entry) => entry.id),
          participants: foundUsers.map((entry) => ({ id: entry.id, username: entry.username, name: entry.name })),
        });

        const nextChat = normalizeChat(created);
        setConversations((prev) => [nextChat, ...prev]);
        setActiveChat(nextChat.id);
        setSearchQuery("");
        return;
      }

      const result = await api.users.search(requested[0]);
      const foundUser = result?.users?.[0] || result?.data?.[0] || result;
      if (!foundUser) return;

      const existingChat = conversations.find((chat) => chat.username === foundUser.username || chat.id === foundUser.id);
      if (existingChat) {
        setActiveChat(existingChat.id);
        return;
      }

      const created = await api.chats.create({ participantId: foundUser.id, username: foundUser.username });
      const nextChat = normalizeChat(created);
      setConversations((prev) => [nextChat, ...prev]);
      setActiveChat(nextChat.id);
      setSearchQuery("");
    } catch (error) {
      setSearchQuery("");
    }
  };

  const handleSendMessage = async (text, options = {}) => {
    const content = text || options.content;
    const contentType = options.contentType || 'text';
    
    if (!activeChat || !content?.trim()) return;

    console.log('emit event: chat-message', { chatId: activeChat, content: content.trim(), contentType });
    try {
      const payload = await api.chats.sendMessage(activeChat, { content: content.trim(), contentType });
      const normalized = normalizeMessages([payload], user);
      if (normalized[0]) {
        setMessages((prev) => (prev.some((msg) => msg.id === normalized[0].id) ? prev : [...prev, normalized[0]]));
        updateChatPreview(activeChat, normalized[0].content, normalized[0].contentType);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          type: "sent",
          sender: user?.name || "You",
          senderAvatar: buildAvatar(user?.name || "You"),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          content: content.trim(),
          contentType,
          imageUrl: contentType === "image" ? content.trim() : null,
          reactions: [],
        },
      ]);
    }
  };

  const handleStarMessage = async (messageId) => {
    if (!activeChat) return;
    try {
      await api.chats.starMessage(activeChat, messageId);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, isStarred: true } : msg))
      );
      const data = await api.messages.starred();
      const starred = Array.isArray(data) ? data : data?.messages || [];
      setStarredMessages(starred);
    } catch (error) {
      console.error("Failed to star message:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!activeChat || !messageId) return;

    let deletedMessage;
    let deletedIndex = -1;
    setMessages((previous) => {
      deletedIndex = previous.findIndex((message) => message.id === messageId);
      deletedMessage = previous[deletedIndex];
      return previous.filter((message) => message.id !== messageId);
    });

    try {
      await api.chats.deleteMessage(activeChat, messageId);
    } catch (error) {
      if (deletedMessage) {
        setMessages((previous) => {
          const restored = [...previous];
          restored.splice(Math.min(deletedIndex, restored.length), 0, deletedMessage);
          return restored;
        });
      }
    }
  };

  const handleUnstarMessage = async (chatId, messageId) => {
    try {
      await api.chats.unstarMessage(chatId, messageId);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, isStarred: false } : msg))
      );
      setStarredMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error("Failed to unstar message:", error);
    }
  };

  const handleJumpToChat = (chatId, messageId) => {
    setActiveChat(chatId);
    setIsMyProfileOpen(false);
    setShowRightPanel(false);
  };

  const handleToggleNotifications = async () => {
    const previousValue = user?.notificationsEnabled !== false;
    const nextValue = !previousValue;
    updateUser({ notificationsEnabled: nextValue });

    try {
      const response = await api.users.updateSettings({ notificationsEnabled: nextValue });
      updateUser(response.user || { notificationsEnabled: nextValue });
    } catch (error) {
      updateUser({ notificationsEnabled: previousValue });
      console.error("Failed to update notifications setting:", error);
    }
  };

  const handleToggleMuteChat = async (chatId) => {
    const previousChat = conversations.find((c) => c.id === chatId);
    const previousMuted = previousChat?.muted || false;
    const nextMuted = !previousMuted;
    setConversations((previous) => previous.map((chat) => chat.id === chatId ? { ...chat, muted: nextMuted } : chat));

    try {
      const response = await api.chats.toggleMute(chatId);
      const muted = Boolean(response?.muted);
      setConversations((previous) => previous.map((chat) => chat.id === chatId ? { ...chat, muted } : chat));
    } catch (error) {
      setConversations((previous) => previous.map((chat) => chat.id === chatId ? { ...chat, muted: previousMuted } : chat));
      console.error("Failed to toggle mute:", error);
    }
  };

  const handleHideChat = async (chatId) => {
    const previousConversations = conversations;
    setConversations((previous) => previous.filter((chat) => chat.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(null);
    }

    try {
      const response = await api.chats.hideChat(chatId);
      const hidden = Boolean(response?.hidden);
      if (!hidden) {
        setConversations(previousConversations);
        if (activeChat === null) {
          setActiveChat(chatId);
        }
      }
    } catch (error) {
      setConversations(previousConversations);
      if (activeChat === null) {
        setActiveChat(chatId);
      }
      console.error("Failed to hide chat:", error);
    }
  };

  const handleToggleBlockUser = async (userId) => {
    const currentBlocked = Array.isArray(user?.blockedUsers) ? user.blockedUsers : [];
    const isBlocked = currentBlocked.includes(String(userId));
    const nextBlocked = isBlocked 
      ? currentBlocked.filter((id) => id !== String(userId))
      : [...new Set([...currentBlocked, String(userId)])];
    updateUser({ blockedUsers: nextBlocked });

    try {
      const response = await api.users.toggleBlock(userId);
      const blocked = Boolean(response?.blocked);
      const updatedBlocked = blocked ? [...new Set([...currentBlocked, String(userId)])] : currentBlocked.filter((id) => id !== String(userId));
      updateUser({ blockedUsers: updatedBlocked });
    } catch (error) {
      updateUser({ blockedUsers: currentBlocked });
      console.error("Failed to toggle block:", error);
    }
  };

  if (loading) {
    return <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-600">Loading chat workspace…</div>;
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (isMobile) {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <MobileLayout
          currentUser={user}
          chats={conversations}
          activeChat={activeChat}
          setActiveChat={handleSelectChat}
          activeNav={activeNav}
          messages={messages}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          onFindUser={startConversationByUsername}
          onOpenMyProfile={openMyProfile}
          onUpdateProfile={updateUser}
          onLogout={handleLogout}
          searchResults={searchResults}
          searchLoading={searchLoading}
        />
      </div>
    );
  }

  const activeChatData = conversations.find((chat) => chat.id === activeChat) || null;
  const rightPanelProfile = isMyProfileOpen ? user : activeChatData || user;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      <NavigationRail
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        currentUser={user}
        onOpenMyProfile={openMyProfile}
        onAddClick={() => {
          setActiveNav("chat");
          setSearchQuery("");
        }}
      />
      <ChatListSidebar
        chats={conversations}
        activeChat={activeChat}
        setActiveChat={handleSelectChat}
        activeNav={activeNav}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        searchLoading={searchLoading}
        onFindUser={startConversationByUsername}
        onSelectSearchResult={selectSearchResult}
        onCreateGroup={handleCreateGroup}
        currentUser={user}
      />
      <ChatArea
        onOpenDetails={openPartnerProfile}
        onOpenProfile={openPartnerProfile}
        showDetailsPanel={showRightPanel}
        activeChat={activeChatData}
        messages={messages}
        onSendMessage={handleSendMessage}
        currentUser={user}
        activeNav={activeNav}
        activeNavLabel={activeNavLabel}
        starredMessages={starredMessages}
        onStarMessage={handleStarMessage}
        onDeleteMessage={handleDeleteMessage}
        onUnstarMessage={handleUnstarMessage}
        onJumpToChat={handleJumpToChat}
        onToggleNotifications={handleToggleNotifications}
        onToggleMuteChat={handleToggleMuteChat}
        onHideChat={handleHideChat}
      />
      {showRightPanel && (
        <RightPanel
          onClose={() => setShowRightPanel(false)}
          profile={rightPanelProfile}
          profileMode={isMyProfileOpen ? "me" : "partner"}
          onUpdateProfile={(updatedUser) => updateUser(updatedUser)}
          onToggleBlockUser={handleToggleBlockUser}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
