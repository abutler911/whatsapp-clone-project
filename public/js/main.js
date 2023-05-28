const socket = io();

const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const messages = document.getElementById("messages");

const username = prompt("Enter your username:");
socket.emit("userJoined", username);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = input.value;
  if (message.trim() !== "") {
    socket.emit("chatMessage", message);
    input.value = "";
  }
});

socket.on("chatMessage", (message) => {
  const timestamp = new Date(); // Get the current timestamp
  const chatData = {
    username: username,
    message: message,
    timestamp: timestamp, // Use the Date object directly as the timestamp value
  };
  socket.emit("message", chatData);
});

socket.on("message", (chatData) => {
  const li = document.createElement("li");
  const username = chatData.username.toUpperCase();
  const message = chatData.message;
  const timestamp = new Date(chatData.timestamp); // Create a new Date object from the received timestamp
  const timestampString = timestamp.toLocaleTimeString();

  if (chatData.systemMessage) {
    li.innerHTML = `<strong class="system-message">${username}: </strong>${message} <span class="timestamp">${timestampString}</span>`;
    li.classList.add("system-message");
  } else {
    li.innerHTML = `<strong>${username}: </strong>${message} <span class="timestamp">${timestampString}</span>`;
  }

  messages.appendChild(li);
});

socket.on("userList", (users) => {
  const userList = document.getElementById("users");
  userList.innerHTML = "";

  users.forEach((user) => {
    const listItem = document.createElement("li");
    listItem.textContent = user.username;
    userList.appendChild(listItem);
  });
});

socket.on("userJoined", (username) => {
  const timestamp = new Date();
  const chatData = {
    username: username,
    timestamp: timestamp,
  };
  socket.emit("userJoined", username);
  socket.emit("message", {
    username: "System",
    message: `${username} joined the chat`,
    timestamp: timestamp,
  });
});

socket.on("userLeft", (username) => {
  const li = document.createElement("li");
  li.textContent = `${username} left the chat`;
  li.classList.add("info-message");
  messages.appendChild(li);
});
