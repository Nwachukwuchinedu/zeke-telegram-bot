# Telegram Community Invite Tracker & Leaderboard Bot (Node.js + MongoDB)

A Node.js Telegram Bot with MongoDB storage that generates unique tracked invite links for community members, records joins in real-time, and provides an interactive leaderboard.

---

## 🚀 Features

- **`/invite`**: Generates a unique, persistent Telegram invite link for each user.
- **Join Tracking**: Detects when new members join using specific links via Telegram's `chat_member` updates.
- **Anti-Cheat**: Prevents self-invites and duplicate counting if a user leaves and rejoins.
- **`/leaderboard` / `/top`**: Shows top inviters formatted with gold, silver, and bronze rankings (`🥇`, `🥈`, `🥉`).
- **`/stats` / `/myinvites`**: Shows individual member rank, total invited users, and their link.
- **MongoDB Atlas Storage**: Cloud persistence that works seamlessly on Render, Railway, VPS, or local development.

---

## 🛠️ Step-by-Step Setup

### 1. Get your Telegram Bot Token
1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Send `/newbot` and follow the prompts to choose a bot name and username.
3. Copy the **HTTP API Token**.

### 2. Get a Free MongoDB Connection URI
1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a free **M0 cluster**.
3. Under **Database Access**, create a user with username and password.
4. Under **Network Access**, add IP `0.0.0.0/0` (allow from anywhere).
5. Click **Connect** ➔ **Drivers** ➔ Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/telegram_invites?retryWrites=true&w=majority
   ```

### 3. Configure `.env`
Update your `.env` file:
```env
BOT_TOKEN=your_bot_token_here
MONGODB_URI=your_mongodb_connection_string_here
GROUP_CHAT_ID=-100xxxxxxxxxx # (Optional, allows generating links in direct messages with the bot)
```

### 4. Add the Bot to your Telegram Group
1. Add the bot to your Telegram Group.
2. Promote the bot to **Administrator** with at least:
   - ✅ **Invite Users via Link** (`can_invite_users`)
   - ✅ **Manage Chat**

### 5. Install Dependencies & Run
```bash
npm install
npm start
```

---

## ☁️ Deploying on Render (Free)

1. Push your repository to **GitHub**.
2. Go to [Render.com](https://dashboard.render.com) and click **New +** ➔ **Background Worker** (or **Web Service**).
3. Connect your GitHub repository.
4. Set the build and start commands:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. In **Environment Variables**, add:
   - `BOT_TOKEN` = `your_telegram_bot_token`
   - `MONGODB_URI` = `your_mongodb_atlas_connection_string`
   - `GROUP_CHAT_ID` = `your_telegram_group_id` (optional)
6. Click **Deploy**! 🚀
