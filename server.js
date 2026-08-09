<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>🕷️ Spider Chat</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #111827;
      color: white;
      height: 100vh;
    }

    .chat {
      width: 100%;
      max-width: 650px;
      height: 100vh;
      margin: auto;
      background: #1f2937;
      display: flex;
      flex-direction: column;
    }

    header {
      background: #111827;
      padding: 15px;
      text-align: center;
    }

    header h1 {
      margin: 0 0 5px;
      font-size: 22px;
    }

    #online {
      color: #9ca3af;
      font-size: 13px;
    }

    #messages {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
    }

    .message {
      background: #374151;
      padding: 10px 13px;
      border-radius: 12px;
      margin-bottom: 10px;
    }

    .sender {
      font-weight: bold;
      margin-bottom: 4px;
    }

    .time {
      color: #9ca3af;
      font-size: 11px;
      margin-top: 5px;
    }

    .system {
      text-align: center;
      color: #9ca3af;
      font-size: 13px;
      margin: 10px 0;
    }

    #typing {
      height: 25px;
      padding: 0 15px;
      color: #9ca3af;
      font-size: 13px;
    }

    form {
      display: flex;
      gap: 8px;
      padding: 10px;
      background: #111827;
    }

    input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      border-radius: 10px;
      padding: 13px;
      font-size: 16px;
    }

    button {
      border: none;
      border-radius: 10px;
      padding: 0 18px;
      background: #2563eb;
      color: white;
      font-size: 16px;
    }

    #login {
      position: fixed;
      inset: 0;
      background: #111827;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .login-box {
      width: 100%;
      max-width: 400px;
      background: #1f2937;
      padding: 25px;
      border-radius: 15px;
      text-align: center;
    }

    .login-box h2 {
      margin-top: 0;
    }

    .login-box input {
      width: 100%;
      margin-bottom: 10px;
    }

    .login-box button {
      width: 100%;
      padding: 13px;
    }
  </style>
</head>

<body>

  <div id="login">
    <div class="login-box">
      <h2>🕷️ Spider Chat</h2>
      <p>یک نام برای ورود انتخاب کن</p>

      <input
        id="username"
        maxlength="20"
        placeholder="نام شما"
        autocomplete="off"
      >

      <button id="joinButton">
        ورود به چت
      </button>
    </div>
  </div>

  <div class="chat">

    <header>
      <h1>🕷️ Spider Chat</h1>
      <div id="online">تعداد آنلاین: 0</div>
    </header>

    <div id="messages"></div>

    <div id="typing"></div>

    <form id="form">
      <input
        id="input"
        placeholder="پیامت رو بنویس..."
        autocomplete="off"
        maxlength="500"
      >

      <button type="submit">
        ارسال
      </button>
    </form>

  </div>

  <script src="/socket.io/socket.io.js"></script>

  <script>
    const socket = io();

    const login = document.getElementById("login");
    const usernameInput = document.getElementById("username");
    const joinButton = document.getElementById("joinButton");

    const messages = document.getElementById("messages");
    const form = document.getElementById("form");
    const input = document.getElementById("input");

    const online = document.getElementById("online");
    const typing = document.getElementById("typing");

    let myName = "";

    function scrollToBottom() {
      messages.scrollTop = messages.scrollHeight;
    }

    function addMessage(message) {
      const div = document.createElement("div");
      div.className = "message";

      const sender = document.createElement("div");
      sender.className = "sender";
      sender.textContent = message.sender;

      const text = document.createElement("div");
      text.textContent = message.text;

      const time = document.createElement("div");
      time.className = "time";
      time.textContent = message.time;

      div.appendChild(sender);
      div.appendChild(text);
      div.appendChild(time);

      messages.appendChild(div);

      scrollToBottom();
    }

    function addSystemMessage(message) {
      const div = document.createElement("div");
      div.className = "system";

      div.textContent = `${message.text} • ${message.time}`;

      messages.appendChild(div);

      scrollToBottom();
    }

    function joinChat() {
      const name = usernameInput.value.trim();

      if (!name) {
        alert("لطفاً یک نام وارد کن.");
        return;
      }

      myName = name;

      socket.emit("join", name);

      login.style.display = "none";
      input.focus();
    }

    joinButton.addEventListener("click", joinChat);

    usernameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        joinChat();
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const text = input.value.trim();

      if (!text) return;

      socket.emit("chat-message", text);

      input.value = "";

      socket.emit("typing", false);

      input.focus();
    });

    input.addEventListener("input", () => {
      socket.emit("typing", input.value.length > 0);
    });

    socket.on("chat-history", (history) => {
      messages.innerHTML = "";

      history.forEach((message) => {
        addMessage(message);
      });
    });

    socket.on("chat-message", (message) => {
      addMessage(message);
    });

    socket.on("system-message", (message) => {
      addSystemMessage(message);
    });

    socket.on("online-count", (count) => {
      online.textContent = `تعداد آنلاین: ${count}`;
    });

    socket.on("typing", (data) => {
      if (data.isTyping) {
        typing.textContent = `${data.username} در حال نوشتن است...`;
      } else {
        typing.textContent = "";
      }
    });

    socket.on("your-name", (name) => {
      myName = name;
    });
  </script>

</body>
</html>
