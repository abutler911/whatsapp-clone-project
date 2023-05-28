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

socket.on("message", ({ username, message }) => {
  const li = document.createElement("li");
  li.innerHTML = `<strong>${username.toUpperCase()}: </strong>${message}`;
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
  const li = document.createElement("li");
  li.textContent = `${username} joined the chat`;
  li.classList.add("info-message");
  messages.appendChild(li);
});

socket.on("userLeft", (username) => {
  const li = document.createElement("li");
  li.textContent = `${username} left the chat`;
  li.classList.add("info-message");
  messages.appendChild(li);
});
