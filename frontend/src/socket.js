// socket.js
import { io } from "socket.io-client";

// Replace with your backend URL in production
export const socket = io("http://localhost:4000", {
  transports: ["websocket"], // Optional: ensure compatibility
});
// Optional: Handle user joining a room
// socket.on("join", (userId) => {
//   socket.join(userId);
// });
// // Optional: Handle disconnection
// socket.on("disconnect", () => {
//   console.log("⚡ Client disconnected:", socket.id);
// });
// // Optional: Handle incoming notifications  
// socket.on("new-notification", (data) => {
//   console.log("📬 New notification received:", data);
//   // You can handle the notification here, e.g., update state or show a toast
// });
// // Optional: Handle project updates
// socket.on("project-updated", (data) => {
//   console.log("📂 Project updated:", data);
//   // You can handle the project update here, e.g., refresh project list
// }); 
// // Optional: Handle project deletion
// socket.on("project-deleted", (data) => {
//   console.log("🗑️ Project deleted:", data);
//   // You can handle the project deletion here, e.g., refresh project list
// });
// // Optional: Handle task updates
// socket.on("task-updated", (data) => {
//   console.log("📝 Task updated:", data);
//   // You can handle the task update here, e.g., refresh task list
// });
// // Optional: Handle task deletion   
// socket.on("task-deleted", (data) => {
//   console.log("🗑️ Task deleted:", data);
//   // You can handle the task deletion here, e.g., refresh task list
// });
// // Optional: Handle user updates
// socket.on("user-updated", (data) => {
//   console.log("👤 User updated:", data);
//   // You can handle the user update here, e.g., refresh user profile
// });
// // Optional: Handle user deletion
// socket.on("user-deleted", (data) => {
//   console.log("🗑️ User deleted:", data);
//   // You can handle the user deletion here, e.g., redirect to login
// });
// // Optional: Handle error events
// socket.on("error", (error) => {
//   console.error("⚠️ Socket.IO error:", error);
//   // Handle the error, e.g., show a toast or log it
// });
// // Optional: Handle connection errors
// socket.on("connect_error", (error) => {
//   console.error("⚠️ Connection error:", error);
//   // Handle the connection error, e.g., show a toast or log it
// });
// // Optional: Handle reconnection attempts
// socket.on("reconnect_attempt", (attempt) => {
//   console.log(`🔄 Reconnection attempt #${attempt}`);
//   // You can handle reconnection logic here if needed
// });
// // Optional: Handle reconnection success
// socket.on("reconnect", (attempt) => {
//   console.log(`✅ Reconnected successfully after ${attempt} attempts`);
//   // You can handle post-reconnection logic here if needed
// });
// // Optional: Handle reconnection failure
// socket.on("reconnect_failed", () => {
//   console.error("❌ Reconnection failed");
//   // Handle the failure, e.g., show a toast or log it
// });
// // Optional: Handle connection state changes
// socket.on("connect", () => {
//   console.log("✅ Connected to Socket.IO server");
// });
