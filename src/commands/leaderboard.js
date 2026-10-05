import { getLeaderboard } from '../db.js';

export async function handleLeaderboard(ctx) {
  const topUsers = await getLeaderboard(10);

  if (!topUsers || topUsers.length === 0) {
    await ctx.reply(
      '🏆 *Community Invite Leaderboard*\n\n' +
      'No invites recorded yet! Be the first by using /invite and sharing your link.',
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];

  let leaderboardText = '🏆 *Top Community Inviters*\n\n';

  topUsers.forEach((user, index) => {
    const position = medals[index] || `*#${index + 1}*`;
    const displayName = user.username 
      ? `@${user.username}` 
      : `${user.firstName || 'Member'}${user.lastName ? ' ' + user.lastName : ''}`;

    leaderboardText += `${position} ${displayName} — *${user.inviteCount}* invites\n`;
  });

  leaderboardText += `\nGet your link and join the board with /invite!`;

  await ctx.reply(leaderboardText, { parse_mode: 'Markdown' });
}
