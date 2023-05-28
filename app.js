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

    io.emit("userList", Array.from(activeUsers.values()));
  });

  socket.on("chatMessage", (message) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      io.emit("message", { username: user.username, message });
    }
  });

  socket.on("disconnect", () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      activeUsers.delete(socket.id);
      io.emit("userList", Array.from(activeUsers.values()));
    }
  });
});

http.listen(port, () => {
  console.log(`Server up on port ${port}...`);
});
