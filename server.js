const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

const messages = [];
const MAX_MESSAGES = 100;
const users = new Map();

function broadcastOnlineCount() {
  io.emit("online-count", users.size);
}

io.on("connection", (socket) => {
  socket.on("join", (username) => {
    const name = String(username || "").trim().slice(0, 20);
    if (!name) return;

    users.set(socket.id, name);

    socket.emit("chat-history", messages);
    socket.emit("your-name", name);

    socket.broadcast.emit("system-message", {
      text: `${name} وارد چت شد 👋`,
      time: new Date().toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit"
      })
    });

    broadcastOnlineCount();
  });

  socket.on("chat-message", (text) => {
    const username = users.get(socket.id);
    if (!username) return;

    const cleanText = String(text || "").trim().slice(0, 500);
    if (!cleanText) return;

    const message = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      sender: username,
      text: cleanText,
      time: new Date().toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    messages.push(message);
    if (messages.length > MAX_MESSAGES) {
      messages.shift();
    }

    io.emit("chat-message", message);
  });

  socket.on("typing", (isTyping) => {
    const username = users.get(socket.id);
    if (!username) return;

    socket.broadcast.emit("typing", {
      username,
      isTyping: Boolean(isTyping)
    });
  });

  socket.on("disconnect", () => {
    const username = users.get(socket.id);
    users.delete(socket.id);

    if (username) {
      socket.broadcast.emit("system-message", {
        text: `${username} از چت خارج شد.`,
        time: new Date().toLocaleTimeString("fa-IR", {
          hour: "2-digit",
          minute: "2-digit"
        })
      });
    }

    broadcastOnlineCount();
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
