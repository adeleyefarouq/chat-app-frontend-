import React from "react";
import { resolveMediaUrl } from "../services/api";

const DEFAULT_PROFILE_AVATAR = "https://ui-avatars.com/api/?name=User&background=7c3aed&color=fff&rounded=true";

function buildAvatar(name, fallback = DEFAULT_PROFILE_AVATAR) {
  if (!name) return fallback;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&rounded=true`;
}

/* ── Icons ── */
const ChatBubbleIcon = ({ active }) => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke={active ? "none" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const GroupIcon = ({ active }) => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill={active ? "white" : "currentColor"}>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const AddCircleIcon = ({ active }) => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke={active ? "none" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

const StarIcon = ({ active }) => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke={active ? "none" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon fill={active ? "white" : "none"} stroke={active ? "none" : "currentColor"} strokeWidth="1.8" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const SettingsIcon = ({ active }) => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill={active ? "white" : "currentColor"}>
    <path
      fill={active ? "white" : "#9ca3af"}
      d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"
    />
  </svg>
);

/* ── AW Logo ── */
const AWLogo = () => (
  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
    <svg width="22" height="18" viewBox="0 0 32 26" fill="none">
      <path d="M2 22 L9 4 L16 16 L23 4 L30 22" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  </div>
);

const NAV_ITEMS = [
  { id: "chat",     label: "Chats",    Icon: ChatBubbleIcon },
  { id: "groups",   label: "Groups",   Icon: GroupIcon },
  { id: "add",      label: "New Chat", Icon: AddCircleIcon },
  { id: "starred",  label: "Starred",  Icon: StarIcon },
  { id: "settings", label: "Settings", Icon: SettingsIcon },
];

export default function NavigationRail({ activeNav, setActiveNav, currentUser, onOpenMyProfile, onAddClick }) {
  const currentAvatar = currentUser?.avatar || currentUser?.image || buildAvatar(currentUser?.name || currentUser?.username || "User");

  const handleNavClick = (id) => {
    if (id === "add") {
      // "+" button triggers search mode, stays on chat view
      onAddClick?.();
      return;
    }
    setActiveNav(id);
  };

  return (
    <div className="hidden lg:flex flex-col items-center w-[68px] bg-white border-r border-gray-100 h-full py-4 shrink-0">
      {/* Logo */}
      <div className="mb-6">
        <AWLogo />
      </div>

      {/* Nav Items */}
      <div className="flex flex-col items-center gap-1 flex-1 w-full px-2">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeNav === id;
          return (
            <div key={id} className="relative w-full flex justify-center">
              {/* Active indicator bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-purple-600"
                  style={{ borderRadius: "0 4px 4px 0" }}
                />
              )}
              <button
                onClick={() => handleNavClick(id)}
                title={label}
                className={`nav-icon w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer border-0 outline-none transition-all ${
                  isActive ? "active shadow-md shadow-purple-200" : "text-gray-400"
                }`}
              >
                <Icon active={isActive} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Profile Avatar */}
      <button
        type="button"
        onClick={onOpenMyProfile}
        className="mt-auto relative border-0 bg-transparent p-0"
      >
        <img
          src={resolveMediaUrl(currentAvatar)}
          alt="My profile"
          className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200 cursor-pointer hover:ring-purple-400 transition-all"
        />
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      </button>
    </div>
  );
}
