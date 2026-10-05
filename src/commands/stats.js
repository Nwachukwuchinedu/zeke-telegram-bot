import { getUserStats } from '../db.js';

export async function handleStats(ctx) {
  const user = ctx.from;
  if (!user) return;

  const stats = await getUserStats(user.id);

  if (!stats) {
    await ctx.reply('You have not generated an invite link yet. Type /invite to get started!');
    return;
  }

  const message = 
`📈 *Your Invite Performance*

👤 Member: *${stats.firstName || user.first_name}*
🎯 Total Invites: *${stats.inviteCount}*
🏅 Leaderboard Rank: *#${stats.rank}*

${stats.inviteLink ? `🔗 Your link: \`${stats.inviteLink}\`` : 'Get your link: /invite'}`;

  await ctx.reply(message, { parse_mode: 'Markdown' });
}
