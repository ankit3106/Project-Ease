// socket.js
import { io } from "socket.io-client";

// Replace with your backend URL in production
export const socket = io("http://localhost:4000", {
  transports: ["websocket"], // Optional: ensure compatibility
});