import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=7c3aed&color=fff&rounded=true";

function sanitizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 24);
}

function sanitizeText(value, maxLength = 160) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

function buildAvatarDataUri(name) {
  const initials = String(name || "User")
    .trim()
    .split(/\s+/)
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AW";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${initials} avatar">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="24" fill="url(#g)" />
      <circle cx="48" cy="36" r="18" fill="white" opacity="0.92" />
      <path d="M24 82c4-16 17-24 24-24s20 8 24 24" fill="white" opacity="0.92" />
      <text x="48" y="90" text-anchor="middle" fill="#6d28d9" font-size="18" font-family="Arial, Helvetica, sans-serif" font-weight="700">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function readFileAsDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });
}

export default function AuthScreen() {
  const { login, register, oauth } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    username: "",
    phone: "",
    email: "",
    password: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getFriendlyAuthError = (caughtError) => {
    const message = String(caughtError?.message || "").toLowerCase();

    if (!message) {
      return mode === "login" ? "Invalid login credentials" : "Unable to create account. Please check your details.";
    }

    const invalidIndicators = ["invalid", "wrong", "incorrect", "credential", "unauthorized", "401", "403", "not found", "already taken", "taken"];
    const isInvalidLogin = mode === "login" && invalidIndicators.some((token) => message.includes(token));

    if (isInvalidLogin) {
      return "Invalid login credentials";
    }

    return caughtError.message;
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);

    try {
      const data = await readFileAsDataUri(file);
      setAvatarPreview(data);
    } catch (caughtError) {
      setError(caughtError.message || "Unable to read the selected image.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (mode === "login") {
      const loginInput = String(form.username || "").trim();
      const password = String(form.password || "").trim();

      if (!loginInput || !password) {
        setError("Invalid login credentials");
        return;
      }

      setLoading(true);

      try {
        await login({ login: loginInput, password });
      } catch (caughtError) {
        setError(getFriendlyAuthError(caughtError));
      } finally {
        setLoading(false);
      }

      return;
    }

    const name = sanitizeText(form.name, 80);
    const username = sanitizeUsername(form.username);
    const phone = sanitizeText(form.phone, 32);
    const email = String(form.email || "").trim().toLowerCase().slice(0, 120);
    const password = String(form.password || "").trim();

    if (!name || !username || !phone || !email || !password) {
      setError("Please complete all account details.");
      return;
    }

    if (!/^[a-z0-9._-]{3,24}$/.test(username)) {
      setError("Username can only contain letters, numbers, dots, underscores, or hyphens.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        username,
        phone,
        email,
        password,
      }, avatarFile || null);
    } catch (caughtError) {
      setError(getFriendlyAuthError(caughtError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-xl font-bold text-white">
            AW
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Real-time chat</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in with your backend account or continue with OAuth.</p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="Full name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="Phone number"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              />
              <input
                type="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
                placeholder="Email address"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                <div className="mb-2 font-semibold text-slate-700">Profile photo (optional)</div>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer rounded-full bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white">
                    Choose image
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="text-slate-500">No photo selected — a default avatar will be created automatically.</span>
                  )}
                </div>
              </div>
            </>
          )}

          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
            placeholder="Username or email"
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          />
          <input
            type="password"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />

          <label className="flex items-center gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            Remember password
          </label>

          {error && <p className="text-sm font-medium text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={() => oauth("google")}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
        >
          Continue with Google OAuth
        </button>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="font-semibold text-purple-600">
            {mode === "login" ? "Create an account" : "Back to sign in"}
          </button>
          <span>{rememberMe ? "Secure session" : "Guest mode"}</span>
        </div>
      </div>
    </div>
  );
}
