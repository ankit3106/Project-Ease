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
require("dotenv").config();
const app = express();
app.use(express.json());
const dbConfig = require("./config/dbConfig");
const port = process.env.PORT || 5000;

const usersRoute = require("./routes/usersRoute");
const projectsRoute = require("./routes/projectsRoute");
const tasksRoute = require("./routes/tasksRoute");
const notificationsRoute = require("./routes/notificationsRoute");

app.use("/api/users", usersRoute);
app.use("/api/projects", projectsRoute);
app.use("/api/tasks", tasksRoute);
app.use("/api/notifications", notificationsRoute);

const path = require("path");
__dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

// Create HTTP server and attach socket.io
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4000", // adjust if your frontend uses a different port
    methods: ["GET", "POST"],
  },
});

// Socket event handlers
io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Optionally, add other global socket event handlers here

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

// Start the server using the HTTP server (not app.listen)
server.listen(port, () =>
  console.log(`Node JS server with socket.io running on port ${port}`)
);