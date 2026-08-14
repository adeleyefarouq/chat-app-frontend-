import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const socketUrl = import.meta.env.VITE_SOCKET_URL || API_BASE.replace(/\/api$/, '') || window.location.origin;

export function createSocket() {
  return io(socketUrl, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket"],
  });
}
