const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
const activeUsers = new Map();

app.get("/", (req, res) => {
  res.render("index");
});

io.on("connection", (socket) => {
  socket.on("userJoined", (username) => {
    const user = {
      id: socket.id,
      username: username,
    };
    activeUsers.set(socket.id, user);

    const timestamp = new Date().getTime();
    io.emit("userList", Array.from(activeUsers.values()));
    io.emit("message", {
      username: "ChatApp Bot",
      message: `${username} joined the chat`,
      timestamp: timestamp,
      systemMessage: true,
    });
  });

  socket.on("chatMessage", (message) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      const timestamp = new Date().getTime();
      const notificationData = {
        sender: user.username,
        message: message,
        timestamp: timestamp,
      };
      io.emit("notification", notificationData);
      io.emit("message", { username: user.username, message, timestamp });
    }
  });

  socket.on("typing", () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.broadcast.emit("typing", user.username); // Broadcast to all other connected clients except the current client
    }
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping"); // Broadcast to all other connected clients except the current client
  });
  socket.on("disconnect", () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      activeUsers.delete(socket.id);

      const timestamp = new Date().getTime();
      io.emit("userList", Array.from(activeUsers.values()));
      io.emit("message", {
        username: "ChatApp Bot",
        message: `${user.username} left the chat`,
        timestamp: timestamp,
        systemMessage: true,
      });
    }
  });
});

http.listen(port, () => {
  console.log(`Server up on port ${port}...`);
});
