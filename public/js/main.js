const socket = io();

const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const messages = document.getElementById("messages");

const username = prompt("Enter your username:");
socket.emit("userJoined", username);

let typing = false;
let typingTimeout;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = input.value;
  if (message.trim() !== "") {
    socket.emit("chatMessage", message);
    input.value = "";
  }
});

input.addEventListener("input", () => {
  if (!typing) {
    typing = true;
    socket.emit("typing");
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typing = false;
    socket.emit("stopTyping");
  }, 1000); // Adjust the delay as desired
});

socket.on("chatMessage", (message) => {
  const timestamp = new Date();
  const chatData = {
    username: username,
    message: message,
    timestamp: timestamp,
  };
  socket.emit("message", chatData);
});

socket.on("message", (chatData) => {
  const li = document.createElement("li");
  const senderUsername = chatData.username.toUpperCase();
  const message = chatData.message;
  const timestamp = new Date(chatData.timestamp);
  const timestampString = timestamp.toLocaleTimeString();

  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");

  const senderName = document.createElement("strong");
  senderName.classList.add("message-sender");
  senderName.textContent = senderUsername;

  const messageText = document.createElement("span");
  messageText.classList.add("message-text");
  messageText.textContent = message;

  const messageTimestamp = document.createElement("span");
  messageTimestamp.classList.add("timestamp");
  messageTimestamp.textContent = timestampString;

  if (senderUsername === username.toUpperCase()) {
    messageContainer.classList.add("sent-message");
    messageContainer.appendChild(senderName);
    messageContainer.appendChild(messageText);
    messageContainer.appendChild(messageTimestamp);
  } else {
    messageContainer.classList.add("received-message");
    messageContainer.appendChild(senderName);
    messageContainer.appendChild(messageText);
    messageContainer.appendChild(messageTimestamp);
  }

  li.appendChild(messageContainer);
  messages.appendChild(li);

  if (chatData.receiver === username) {
    showNotification(chatData.sender, chatData.message);
  }
});

socket.on("userList", (users) => {
  const userList = document.getElementById("users");
  userList.innerHTML = "";

  users.forEach((user) => {
    const listItem = document.createElement("li");
    listItem.textContent = user.username;

    if (user.username === username) {
      listItem.classList.add("current-user");
    }

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

socket.on("typing", (username) => {
  // Display typing indicator for the user
  const typingIndicator = document.getElementById("typing-indicator");
  typingIndicator.textContent = `${username
    .charAt(0)
    .toUpperCase()}${username.slice(1)} is typing...`;
});

socket.on("stopTyping", () => {
  // Hide typing indicator
  const typingIndicator = document.getElementById("typing-indicator");
  typingIndicator.textContent = "";
});

socket.on("notification", (notificationData) => {
  showNotification(notificationData.sender, notificationData.message);
});

function showNotification(sender, message) {
  const notificationSound = new Audio("/media/ding.mp3");
  notificationSound.play();
}
