import React, { useEffect, useState } from "react";
import { api, resolveMediaUrl } from "../services/api";

const DEFAULT_PROFILE_AVATAR = "https://ui-avatars.com/api/?name=User&background=7c3aed&color=fff&rounded=true";
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

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
    <line x1="11" y1="18" x2="13" y2="18"/>
  </svg>
);

function ChatItem({ chat, isActive, onClick }) {
  const avatar = chat.isGroup ? DEFAULT_GROUP_AVATAR : (chat.avatar || buildAvatar(chat.name));

  return (
    <div
      onClick={() => onClick(chat.id)}
      className={`chat-item flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mx-2 ${isActive ? "active" : ""}`}
    >
      <div className="relative shrink-0">
        <img src={resolveMediaUrl(avatar)} alt={chat.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
        {chat.isOnline && (
          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="font-semibold text-gray-800 text-sm truncate">{chat.name}</span>
          <span className="text-[10px] text-gray-400 shrink-0">{chat.time}</span>
        </div>
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs text-gray-500 truncate">{chat.lastMessage}</span>
          {chat.unread > 0 && (
            <span className="shrink-0 min-w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center px-1">
              {chat.unread}
            </span>
          )}
          {isActive && chat.unread === 0 && (
            <span className="shrink-0 w-2 h-2 rounded-full bg-purple-500" />
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResultItem({ user, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(user)}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left w-full"
    >
      <img src={resolveMediaUrl(user.avatar || buildAvatar(user.name || user.username))} alt={user.name || user.username} className="w-10 h-10 rounded-full object-cover shrink-0" />
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-gray-800">{user.name || user.username}</div>
        <div className="truncate text-xs text-gray-500">@{user.username}</div>
      </div>
    </button>
  );
}

function GroupMemberItem({ user, checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(user)}
      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left w-full"
    >
      <div className="flex items-center gap-3 min-w-0">
        <img src={resolveMediaUrl(user.avatar || buildAvatar(user.name || user.username))} alt={user.name || user.username} className="w-10 h-10 rounded-full object-cover shrink-0" />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-800">{user.name || user.username}</div>
          <div className="truncate text-xs text-gray-500">@{user.username}</div>
        </div>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(user)}
        onClick={(event) => event.stopPropagation()}
        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
      />
    </button>
  );
}

export default function ChatListSidebar({
  chats = [],
  activeChat,
  setActiveChat,
  activeNav,
  searchQuery,
  setSearchQuery,
  searchResults = [],
  searchLoading = false,
  onFindUser,
  onSelectSearchResult,
  onCreateGroup,
  currentUser,
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [groupSearchResults, setGroupSearchResults] = useState([]);
  const [groupSearchLoading, setGroupSearchLoading] = useState(false);
  const filters = ["All", "Unread", "Groups", "Mentions"];
  const normalizedQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    const term = groupSearchQuery.trim();
    if (!term) {
      setGroupSearchResults([]);
      setGroupSearchLoading(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        setGroupSearchLoading(true);
        const data = await api.users.search(term);
        const matches = Array.isArray(data?.users) ? data.users : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        const filteredMatches = matches.filter((user) => {
          const id = user.id || user._id;
          const username = user.username || "";
          const currentUserId = currentUser?.id || currentUser?._id;
          const currentUsername = currentUser?.username || "";
          return id !== currentUserId && username !== currentUsername;
        });
        setGroupSearchResults(filteredMatches.map((entry) => ({
          ...entry,
          avatar: entry.avatar || buildAvatar(entry.name || entry.username || term),
        })));
      } catch (error) {
        setGroupSearchResults([]);
      } finally {
        setGroupSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [groupSearchQuery, currentUser]);

  const filteredRecent = chats.filter((chat) => {
    const haystack = `${chat.name} ${chat.username || ""}`.toLowerCase();
    if (normalizedQuery) return haystack.includes(normalizedQuery);
    if (activeNav === "groups" || activeFilter === "Groups") return chat.isGroup;
    if (activeFilter === "Unread") return chat.unread > 0;
    return true;
  });

  const toggleGroupUser = (user) => {
    const userId = user?.id || user?._id;
    if (!userId) return;

    setSelectedGroupUsers((current) => {
      const exists = current.some((entry) => (entry.id || entry._id) === userId);
      if (exists) {
        return current.filter((entry) => (entry.id || entry._id) !== userId);
      }
      return [...current, user];
    });
  };

  const resetGroupCreator = () => {
    setGroupName("");
    setSelectedGroupUsers([]);
    setShowCreateGroup(false);
    setCreatingGroup(false);
  };

  const handleCreateGroupSubmit = async () => {
    const trimmedName = groupName.trim();
    const participantIds = selectedGroupUsers.map((user) => user.id || user._id).filter(Boolean);

    if (!trimmedName || participantIds.length < 2) {
      return;
    }

    try {
      setCreatingGroup(true);
      await onCreateGroup?.({ participants: participantIds, name: trimmedName });
      resetGroupCreator();
    } catch (error) {
      console.error("Group creation failed", error);
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <div className="hidden md:flex flex-col w-[300px] xl:w-[320px] bg-white border-r border-gray-100 h-full shrink-0 relative">
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
            <span className="text-gray-400 shrink-0">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search or start a new chat"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onFindUser?.(searchQuery);
                }
              }}
              className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder-gray-400 min-w-0"
            />
          </div>
          <button
            type="button"
            title="Create group"
            onClick={() => {
              setShowCreateGroup(true);
              setSearchQuery("");
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors shrink-0"
          >
            <span className="text-xl leading-none font-light">+</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`filter-chip text-xs font-semibold px-3 py-1.5 rounded-full border-0 outline-none ${
                activeFilter === filter ? "active" : ""
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
        {searchQuery.trim() ? (
          <div className="px-2 pb-3">
            <div className="px-3 py-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Search results</span>
            </div>
            {searchLoading && <div className="px-3 text-xs text-gray-500">Searching…</div>}
            {!searchLoading && searchResults.length === 0 && (
              <div className="px-3 text-xs text-gray-500">No matching users found.</div>
            )}
            {searchResults.map((user) => (
              <SearchResultItem key={user.id || user.username} user={user} onSelect={onSelectSearchResult} />
            ))}
          </div>
        ) : null}

        <div>
          <div className="px-5 py-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent</span>
          </div>
          {filteredRecent.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={activeChat === chat.id}
              onClick={setActiveChat}
            />
          ))}
          {filteredRecent.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <span className="text-3xl mb-2">🔍</span>
              <span className="text-sm">No chats found</span>
            </div>
          )}
        </div>
      </div>

      {showCreateGroup && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/25 p-4 backdrop-blur-[1px]">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Create group</h3>
                <p className="text-xs text-gray-500">Select members and set a group name</p>
              </div>
              <button
                type="button"
                onClick={resetGroupCreator}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Group name</label>
              <input
                type="text"
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder="e.g. Product Team"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 focus:bg-white"
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Selected members</span>
                <span className="text-[11px] text-gray-400">{selectedGroupUsers.length} selected</span>
              </div>

              {selectedGroupUsers.length > 0 ? (
                <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
                  {selectedGroupUsers.map((user) => (
                    <button
                      key={user.id || user._id || user.username}
                      type="button"
                      onClick={() => toggleGroupUser(user)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700"
                    >
                      {user.name || user.username}
                      <span className="text-base leading-none">×</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-xs text-gray-400">No members selected yet.</div>
              )}
            </div>

            <div className="mt-4">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Add members</div>
              <input
                type="text"
                value={groupSearchQuery}
                onChange={(event) => setGroupSearchQuery(event.target.value)}
                placeholder="Search usernames"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 focus:bg-white"
              />
              {groupSearchLoading && <div className="px-2 mt-2 text-xs text-gray-500">Searching…</div>}
              {!groupSearchLoading && groupSearchResults.length === 0 && groupSearchQuery.trim() && (
                <div className="px-2 mt-2 text-xs text-gray-500">No matching users found.</div>
              )}
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1 mt-2">
                {groupSearchResults.map((user) => (
                  <GroupMemberItem
                    key={user.id || user.username}
                    user={user}
                    checked={selectedGroupUsers.some((entry) => (entry.id || entry._id) === (user.id || user._id))}
                    onToggle={toggleGroupUser}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={creatingGroup || !groupName.trim() || selectedGroupUsers.length < 2}
              onClick={handleCreateGroupSubmit}
              className="mt-5 w-full rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {creatingGroup ? "Creating group…" : "Create group"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
