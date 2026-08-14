import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

function readToken() {
  return typeof window !== "undefined" ? sessionStorage.getItem("chat-app-token") : null;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.auth.me();
        setUser(data.user || data);
      } catch (error) {
        sessionStorage.removeItem("chat-app-token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const updateUser = (partialUser) => {
    setUser((currentUser) => ({ ...(currentUser || {}), ...partialUser }));
  };

  const value = useMemo(() => ({
    token,
    user,
    loading,
    login: async (credentials) => {
      const data = await api.auth.login(credentials);
      if (data.token) {
        sessionStorage.setItem("chat-app-token", data.token);
        setToken(data.token);
      }
      setUser(data.user || data);
      return data;
    },
    register: async (payload, avatarFile = null) => {
      const data = await api.auth.register(payload, avatarFile);
      if (data.token) {
        sessionStorage.setItem("chat-app-token", data.token);
        setToken(data.token);
      }
      setUser(data.user || data);
      return data;
    },
    updateUser,
    logout: () => {
      sessionStorage.removeItem("chat-app-token");
      setToken(null);
      setUser(null);
    },
    oauth: (provider = "google") => api.auth.oauth(provider),
  }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
