// const express = require("express");
// require("dotenv").config();
// const app = express();
// app.use(express.json());
// const dbConfig = require("./config/dbConfig");
// const port = process.env.PORT || 5000;

// const usersRoute = require("./routes/usersRoute");
// const projectsRoute = require("./routes/projectsRoute");
// const tasksRoute = require("./routes/tasksRoute");
// const notificationsRoute = require("./routes/notificationsRoute");

// app.use("/api/users", usersRoute);
// app.use("/api/projects", projectsRoute);
// app.use("/api/tasks", tasksRoute);
// app.use("/api/notifications", notificationsRoute);

// const path = require("path");
// __dirname = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "/client/build")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "client", "build", "index.html"));
//   });
// }

// app.listen(port, () => console.log(`Node JS server listening on port ${port}`));

const express = require("express");
const http = require("http");
require("dotenv").config();
const path = require("path");

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", // Set to your frontend domain in production
    methods: ["GET", "POST"]
  }
});
app.set("io", io); // Makes io accessible in routes via req.app.get("io")

// Middleware
app.use(express.json());
const dbConfig = require("./config/dbConfig");

// Routes
const usersRoute = require("./routes/usersRoute");
const projectsRoute = require("./routes/projectsRoute");
const tasksRoute = require("./routes/tasksRoute");
const notificationsRoute = require("./routes/notificationsRoute");

app.use("/api/users", usersRoute);
app.use("/api/projects", projectsRoute);
app.use("/api/tasks", tasksRoute);
app.use("/api/notifications", notificationsRoute);

// Production setup to serve frontend
__dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

// Socket.IO listeners
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // Optional: Join user-specific room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("👋 Client disconnected:", socket.id);
  });

  socket.on("send-notification", (data) => {
    io.emit("new-notification", data);
  });
});

// Start server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});