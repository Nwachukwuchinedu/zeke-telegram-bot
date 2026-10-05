import { getOrCreateUser, saveUserInviteLink } from '../db.js';

export async function handleInvite(ctx) {
  const user = ctx.from;
  if (!user) return;

  // Ensure user is recorded in MongoDB
  const dbUser = await getOrCreateUser(user.id, {
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
  });

  // Determine target chat ID
  let targetChatId = process.env.GROUP_CHAT_ID;

  // If used directly in a group/supergroup, use that chat ID
  if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
    targetChatId = ctx.chat.id;
  }

  if (!targetChatId) {
    await ctx.reply(
      '⚠️ Group ID is not configured.\n' +
      'Please use this command inside the group or set `GROUP_CHAT_ID` in your `.env` file.'
    );
    return;
  }

  try {
    let inviteLink = dbUser.inviteLink;

    // Generate link if not already generated
    if (!inviteLink) {
      const linkObj = await ctx.api.createChatInviteLink(targetChatId, {
        name: `Inviter_${user.id}_${user.username || user.first_name || 'user'}`,
        creates_join_request: false,
      });

      inviteLink = linkObj.invite_link;
      await saveUserInviteLink(user.id, inviteLink, targetChatId);
    }

    const message = 
`🔗 *Your Personal Invite Link*

Share this link with your friends to invite them to the community:
👉 \`${inviteLink}\`

📊 *Your Stats:*
• Total Invites: *${dbUser.inviteCount || 0}*
• Tracked automatically whenever someone joins using your link!

Check current standings with /leaderboard`;

    await ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error creating invite link:', error);
    await ctx.reply(
      '❌ *Failed to generate invite link.*\n\n' +
      'Make sure the bot is an **Administrator** in the group with the permission:\n' +
      '• *Invite Users via Link* (`can_invite_users`)\n' +
      '• *Manage Chat*',
      { parse_mode: 'Markdown' }
    );
  }
}
