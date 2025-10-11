import { io, Socket } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

// The socket instance is created lazily so that it only runs on the client.
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(socketUrl, { autoConnect: true });
  }
  return socket;
}
