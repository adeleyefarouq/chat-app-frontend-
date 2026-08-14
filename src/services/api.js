// ✅ Hardcode your Render URL as the default fallback
const rawApiUrl = import.meta.env.VITE_API_URL || "https://chat-app-acpl.onrender.com";
const API_BASE = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl.replace(/\/$/, "")}/api`;

export function resolveMediaUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path) || /^data:/i.test(path) || /^blob:/i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = API_BASE === "/api"
    ? "http://localhost:5000"
    : API_BASE.replace(/\/api\/?$/, "");

  return `${baseUrl}${normalizedPath}`;
}

function getStoredToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem("chat-app-token") : null;
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const isFormData = options.body instanceof FormData;
  const config = {
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    ...options,
  };

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (path === '/chats' && config.body) {
    console.log('[api.request] /chats request config body:', config.body);
    console.log('[api.request] /chats request config:', { ...config, body: config.body });
  }

  const response = await fetch(`${API_BASE}${path}`, config);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload?.message || payload?.error || "Request failed";
    throw new Error(message);
  }

  return payload;
}

export const api = {
  auth: {
    me: () => request("/auth/me"),
    login: (credentials) => request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
    register: (payload) => request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    oauth: (provider = "google") => {
      const href = `${API_BASE}/auth/${provider}`;
      window.location.href = href;
    },
  },
  users: {
    search: (query) => request(`/users/search?username=${encodeURIComponent(query)}`),
    updateProfile: (payload) => request("/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
    updateSettings: (payload) => request("/users/me/settings", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
    toggleBlock: (userId) => request(`/users/me/block/${userId}`, {
      method: "PATCH",
    }),
    uploadAvatar: async (file) => {
      console.log('[api.users.uploadAvatar] file:', { name: file.name, size: file.size, type: file.type });
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await request("/users/me/avatar", {
        method: "POST",
        body: formData,
      });
      console.log('[api.users.uploadAvatar] response:', res);
      return res;
    },
  },
  chats: {
    list: () => request("/chats"),
    create: (payload) => {
      console.log('[api.chats.create] payload:', JSON.stringify(payload));
      return request("/chats", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    messages: (chatId) => request(`/chats/${chatId}/messages`),
    sendMessage: (chatId, payload) => request(`/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    uploadImage: (chatId, file) => {
      const formData = new FormData();
      formData.append("image", file);
      return request(`/chats/${chatId}/messages/image`, {
        method: "POST",
        body: formData,
      });
    },
    starMessage: (chatId, messageId) => request(`/chats/${chatId}/messages/${messageId}/star`, {
      method: "POST",
    }),
    unstarMessage: (chatId, messageId) => request(`/chats/${chatId}/messages/${messageId}/star`, {
      method: "DELETE",
    }),
    toggleMute: (chatId) => request(`/chats/${chatId}/mute`, {
      method: "PATCH",
    }),
    hideChat: (chatId) => request(`/chats/${chatId}/hide`, {
      method: "PATCH",
    }),
  },
  messages: {
    starred: () => request("/messages/starred"),
  },
};

export const API_BASE_URL = API_BASE;
