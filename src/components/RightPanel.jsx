import React, { useState, useEffect } from "react";
import { api, resolveMediaUrl } from "../services/api";

const DEFAULT_PROFILE_AVATAR = "https://ui-avatars.com/api/?name=User&background=7c3aed&color=fff&rounded=true";

function buildAvatar(name, fallback = DEFAULT_PROFILE_AVATAR) {
  if (!name) return fallback;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff&rounded=true`;
}

const StarIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const FileIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const BellIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

function ToggleSwitch({ checked, onChange }) {
  return (
    <div onClick={onChange} className="relative cursor-pointer" style={{ width: "44px", height: "24px" }}>
      <div className={`absolute inset-0 rounded-full transition-colors duration-300 ${checked ? "bg-purple-600" : "bg-gray-300"}`} />
      <div className="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-all duration-300" style={{ left: checked ? "23px" : "3px" }} />
    </div>
  );
}

function OptionRow({ icon, label, rightElement }) {
  return (
    <button className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-gray-50 transition-colors text-left w-full group">
      <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 transition-colors shrink-0 group-hover:scale-105" style={{ transition: "all 0.15s" }}>
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium text-gray-700">{label}</span>
      {rightElement}
    </button>
  );
}

export default function RightPanel({ onClose, profile, profileMode = "partner", onUpdateProfile, onToggleBlockUser }) {
  const [notifications, setNotifications] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar || profile?.image || buildAvatar(profile?.name || profile?.username || "User"));
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    about: profile?.about || "",
  });

  const profileName = profile?.name || profile?.username || "User";
  const profileStatus = profile?.status || (profile?.isOnline ? "Online" : "Offline");
  const profileAbout = profile?.about || profile?.bio || profile?.description || "No description available.";
  const profileMeta = [profile?.username ? `@${profile.username}` : null, profile?.email || null].filter(Boolean);

  const normalizedAvatar = avatarPreview || profile?.avatar || profile?.image || buildAvatar(profileName);

  useEffect(() => {
    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      about: profile?.about || "",
    });
    setAvatarPreview(profile?.avatar || profile?.image || buildAvatar(profileName));
    setAvatarFile(null);
    setError("");
    if (profileMode !== "me") {
      setIsEditing(false);
    }
  }, [profile, profileName, profileMode]);

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    console.log('[RightPanel] selected avatar file:', { name: file.name, size: file.size, type: file.type });

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(String(reader.result || ""));
      setAvatarFile(file);
    };
    reader.onerror = () => {
      setError("Unable to read the selected image.");
    };
    reader.readAsDataURL(file);

    // Auto-upload immediately after selection
    setSaving(true);
    setError("");
    try {
      console.log('[RightPanel] auto-uploading avatar file now');
      const uploadResponse = await api.users.uploadAvatar(file);
      console.log('[RightPanel] auto-upload response:', uploadResponse);
      const updatedUser = uploadResponse.user || uploadResponse;
      onUpdateProfile?.(updatedUser);
      setAvatarPreview(updatedUser.avatar || String(reader.result || "") || buildAvatar(profile?.name || profile?.username || "User"));
      setAvatarFile(null);
    } catch (caughtError) {
      console.error('[RightPanel] auto-upload error:', caughtError);
      setError(caughtError.message || "Unable to upload avatar.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      let updatedUser = profile;

      if (avatarFile) {
        console.log('[RightPanel] uploading avatar file:', { name: avatarFile.name, size: avatarFile.size, type: avatarFile.type });
        const uploadResponse = await api.users.uploadAvatar(avatarFile);
        console.log('[RightPanel] upload response:', uploadResponse);
        updatedUser = uploadResponse.user || uploadResponse;
      }

      const profilePayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        about: formData.about,
      };

      const response = await api.users.updateProfile(profilePayload);
      updatedUser = response.user || response;
      onUpdateProfile?.(updatedUser);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(updatedUser.avatar || normalizedAvatar);
    } catch (caughtError) {
      setError(caughtError.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-[280px] xl:w-[300px] bg-white border-l border-gray-100 h-full shrink-0" style={{ overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}>
      <div className="relative flex flex-col items-center pt-10 pb-7 px-4 shrink-0" style={{ background: "linear-gradient(150deg, #c4b5fd 0%, #a78bfa 35%, #8b5cf6 70%, #7c3aed 100%)" }}>
        <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors">
          <CloseIcon />
        </button>
        {profileMode !== "me" && (
          <button
            type="button"
            onClick={() => onToggleBlockUser?.(profile?.id)}
            className="absolute top-3 left-3 rounded-full border border-white/40 bg-white/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white hover:bg-white/20"
          >
            {(profile?.blockedUsers || []).includes(profile?.id) ? "Unblock" : "Block"}
          </button>
        )}

        <div className="relative mb-3">
          <div className="w-[88px] h-[88px] rounded-full p-0.5 bg-white/30 shadow-xl block overflow-hidden">
            <img src={resolveMediaUrl(normalizedAvatar)} alt={profileName} className="w-full h-full rounded-full object-cover border-3 border-white" style={{ border: "3px solid white" }} />
          </div>
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
        </div>

        <h3 className="font-bold text-white text-base leading-tight text-center tracking-tight">{profileName}</h3>
        <p className="text-white/75 text-xs mt-1 font-medium">{profileStatus}</p>

        {profileMode === "me" && (
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/40 bg-white/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/30">
            Change photo
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        )}
      </div>

      <div className="px-4 py-4 flex flex-col gap-1">
        <div className="mb-3">
          <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-2">About</h4>
          {profileMode === "me" ? (
            <textarea
              value={formData.about}
              onChange={(event) => setFormData((current) => ({ ...current, about: event.target.value }))}
              className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-3 py-3 text-sm text-gray-700 outline-none resize-none h-24"
              placeholder="Write something about yourself"
            />
          ) : (
            <p className="text-sm text-gray-500 leading-relaxed">{profileAbout}</p>
          )}
        </div>

        {profileMode === "me" && (
          <>
            <div className="mb-4">
              <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-2">Details</h4>
              <div className="space-y-3">
                <input
                  value={formData.name}
                  onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-700 outline-none"
                  placeholder="Full name"
                />
                <input
                  value={formData.email}
                  onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-700 outline-none"
                  placeholder="Email address"
                />
                <input
                  value={formData.phone}
                  onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-700 outline-none"
                  placeholder="Phone number"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

            <div className="flex flex-col gap-3">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 transition"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setError("");
                      setAvatarFile(null);
                      setAvatarPreview(profile?.avatar || profile?.image || buildAvatar(profileName));
                      setFormData({
                        name: profile?.name || "",
                        email: profile?.email || "",
                        phone: profile?.phone || "",
                        about: profile?.about || "",
                      });
                    }}
                    className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-purple-600 border border-purple-200 hover:bg-purple-50 transition"
                >
                  Edit profile
                </button>
              )}
            </div>
          </>
        )}

        {profileMode !== "me" && profileMeta.length > 0 && (
          <div className="mb-3">
            <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-2">Profile</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {profileMeta.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 mb-2" />
        <OptionRow icon={<StarIcon />} label="Starred Messages" rightElement={<ChevronRightIcon />} />
        <OptionRow icon={<FileIcon />} label="Shared Files" rightElement={<ChevronRightIcon />} />
        <OptionRow icon={<BellIcon />} label="Notifications" rightElement={<ToggleSwitch checked={notifications} onChange={() => setNotifications((value) => !value)} />} />
      </div>
    </div>
  );
}
