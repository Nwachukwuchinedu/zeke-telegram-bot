import { getUserByInviteLink, recordSuccessfulJoin } from '../db.js';

export async function handleChatMemberUpdate(ctx) {
  const update = ctx.chatMember;
  if (!update) return;

  const oldStatus = update.old_chat_member.status;
  const newStatus = update.new_chat_member.status;

  // Detect when a user joins the chat
  const isJoining = ['left', 'kicked'].includes(oldStatus) && ['member', 'restricted', 'administrator'].includes(newStatus);

  if (!isJoining) return;

  const joinedUser = update.new_chat_member.user;
  const inviteLinkObj = update.invite_link;

  if (!inviteLinkObj || !inviteLinkObj.invite_link) {
    console.log(`User ${joinedUser.id} (${joinedUser.first_name}) joined without a tracked invite link or via public link.`);
    return;
  }

  const rawInviteLink = inviteLinkObj.invite_link;
  const inviter = await getUserByInviteLink(rawInviteLink);

  if (!inviter) {
    console.log(`Invite link ${rawInviteLink} was used, but no registered inviter found in database.`);
    return;
  }

  // Prevent self-invitation cheat
  if (inviter.userId === joinedUser.id) {
    return;
  }

  const result = await recordSuccessfulJoin(joinedUser.id, inviter.userId, rawInviteLink);

  if (result.success) {
    const inviterName = inviter.username ? `@${inviter.username}` : (inviter.firstName || 'A community member');
    const newUserName = joinedUser.username ? `@${joinedUser.username}` : (joinedUser.first_name || 'New member');

    console.log(`[Invite Tracked] ${newUserName} joined using link from ${inviterName}. Total: ${result.inviter.inviteCount}`);

    // Announce in chat
    try {
      await ctx.api.sendMessage(
        ctx.chat.id,
        `🎉 Welcome ${newUserName} to the group!\n` +
        `👏 Invited by ${inviterName} (Total invites: *${result.inviter.inviteCount}*)`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('Failed to send welcome message in chat:', err.message);
    }
  }
}
