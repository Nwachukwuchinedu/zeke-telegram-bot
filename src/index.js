import 'dotenv/config';
import { Bot } from 'grammy';
import { connectDB } from './db.js';
import { handleInvite } from './commands/invite.js';
import { handleLeaderboard } from './commands/leaderboard.js';
import { handleStats } from './commands/stats.js';
import { handleChatMemberUpdate } from './handlers/chatMember.js';

const token = process.env.BOT_TOKEN;

if (!token || token === 'your_bot_token_here') {
  console.error('❌ Error: BOT_TOKEN is missing in .env file!');
  console.error('Please create a bot via @BotFather on Telegram, copy the token to .env, and try again.');
  process.exit(1);
}

// 1. Connect to MongoDB
try {
  await connectDB();
} catch (error) {
  console.error('Failed to connect to MongoDB. Exiting application.');
  process.exit(1);
}

// 2. Initialize Telegram Bot
const bot = new Bot(token);

// 3. Register Commands
bot.command('start', async (ctx) => {
  const welcomeText = 
`👋 *Welcome to the Community Invite Tracker Bot!*

Here is how to use me:
• /invite — Generate your personalized group invite link
• /leaderboard — View top inviters in the community
• /stats — Check your personal invite counts & ranking
• /help — Bot setup instructions & commands

⚡️ *Group Admins:* Add me to your group as an *Administrator* with invite link permissions to start tracking!`;

  await ctx.reply(welcomeText, { parse_mode: 'Markdown' });
});

bot.command(['invite', 'link'], handleInvite);
bot.command(['leaderboard', 'top'], handleLeaderboard);
bot.command(['stats', 'myinvites'], handleStats);

bot.command('id', async (ctx) => {
  await ctx.reply(
    `📌 *Chat Information:*\n• Title: *${ctx.chat.title || 'Private'}*\n• Chat ID: \`${ctx.chat.id}\``,
    { parse_mode: 'Markdown' }
  );
});

bot.command('help', async (ctx) => {
  const helpText = 
`📖 *Bot Help & Instructions*

*For Members:*
1. Type /invite to get your unique referral link.
2. Share the link with friends.
3. When they join the group using your link, your invite score increases automatically!
4. Type /leaderboard to check who is leading the rankings.

*For Group Administrators:*
1. Add this bot to your Telegram Group.
2. Promote the bot to *Admin*.
3. Ensure it has the permission *Invite Users via Link* (and *Manage Chat*).`;

  await ctx.reply(helpText, { parse_mode: 'Markdown' });
});

// 4. Handle member join events (track invite link usage)
bot.on('chat_member', handleChatMemberUpdate);

// 5. Global Error Handling
bot.catch((err) => {
  console.error('Bot Error encountered:', err);
});

// 6. Set Bot Command Menu in Telegram
bot.api.setMyCommands([
  { command: 'invite', description: 'Get your unique invite link' },
  { command: 'leaderboard', description: 'View the invite leaderboard' },
  { command: 'stats', description: 'View your invite statistics' },
  { command: 'help', description: 'Instructions and guide' },
]).catch(console.error);

// 7. Start Polling with chat_member updates enabled
console.log('🚀 Telegram Invite Bot is starting...');
bot.start({
  allowed_updates: ['message', 'chat_member'],
  onStart: (botInfo) => {
    console.log(`✅ Logged in as @${botInfo.username}`);
    console.log('Listening for messages and chat join events...');
  },
});
