# 🤖 WeChat Telegram Bot (`wechat-bot`)

> A bridge linking WeChat events to a centralized Telegram control center. Built for automation, user tracking, and seamless cross-platform notification.

---

## 🌟 Key Features

* **Bi-Directional Bridging**: Seamlessly forward WeChat user commands straight to a dedicated Telegram chat.
* **Unified Command System**: Listen to, process, and reply to `anyuser` commands directly from your Telegram interface.
* **Live Commercial Analytics**: Track digital asset deliveries, account acquisitions, and transaction statuses on your local computer.
* **Granular Audit Logs**: Keep precise tabs on user identities, operational timestamps, and purchase histories.
* **Quiet Background Worker**: Operates as a headless system service utilizing minimal local resources.

---

## 📦 System Architecture

```text
┌──────────────┐      ┌──────────────┐      ┌─────────────────┐
│              │      │              │      │                 │
│ WeChat User  ├─────►│  wechat-bot  ├─────►│  Telegram Bot  │
│  (Commands)  │      │ (Core Relay) │      │ (Control Panel) │
│              │      │              │      │                 │
└──────────────┘      └──────┬───────┘      └─────────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Local Engine │
                      │ (Live Track) │
                      └──────────────┘
```

---

## 🛠️ Quick Start

### 1. Prerequisites
Ensure you have the following installed on your host machine:
* Node.js (v18+) or Python (3.10+)
* A Telegram Bot Token (generated via [@BotFather](https://t.me))
* A verified WeChat account for automation staging

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com
cd wechat-bot
npm install  # or pip install -r requirements.txt
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_personal_chat_id
WECHAT_DAEMON_PORT=8080
LOG_LEVEL=info
```

### 4. Running the Engine
Start the local server daemon:
```bash
npm start  # or python main.py
```

---

## 📊 Live Tracking & Operations

The application launches an interactive console on your computer. You can monitor the real-time operational pipeline directly inside your terminal or designated output logs:

```synopsis
[2026-07-24 13:14:02] [INFO]  WeChat listener authenticated successfully.
[2026-07-24 13:14:15] [CMD]   Received WeChat command from User_8921: "/buy premium_acc"
[2026-07-24 13:14:16] [TG]    Forwarding purchase intent to Telegram Admin Room...
[2026-07-24 13:14:18] [TRACK] Transaction Success: User_8921 acquired premium_acc. Local ledger updated.
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page to optimize the webhook delivery or add new command subroutines.

---

## 📄 License

This project is licensed under the MIT License.