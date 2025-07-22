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

app.listen(port, () => console.log(`Node JS server listening on port ${port}`));
