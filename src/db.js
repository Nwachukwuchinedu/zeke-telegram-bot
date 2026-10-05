import mongoose from 'mongoose';

// 1. Define Schemas & Models
const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true, index: true },
  username: { type: String, default: null },
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  inviteCount: { type: Number, default: 0, index: true },
  inviteLink: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

const joinedMemberSchema = new mongoose.Schema({
  joinedUserId: { type: Number, required: true, unique: true, index: true },
  inviterId: { type: Number, required: true, index: true },
  inviteLink: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
});

const inviteLinkSchema = new mongoose.Schema({
  inviteLink: { type: String, required: true, unique: true, index: true },
  userId: { type: Number, required: true, index: true },
  chatId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', userSchema);
export const JoinedMember = mongoose.model('JoinedMember', joinedMemberSchema);
export const InviteLink = mongoose.model('InviteLink', inviteLinkSchema);

// 2. Connect to MongoDB
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in your environment variables (.env)');
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    throw error;
  }
}

// 3. User operations
export async function getOrCreateUser(userId, userData = {}) {
  let user = await User.findOne({ userId });

  if (!user) {
    user = await User.create({
      userId,
      username: userData.username || null,
      firstName: userData.first_name || null,
      lastName: userData.last_name || null,
      inviteCount: 0,
      inviteLink: null,
    });
  } else if (userData.username || userData.first_name || userData.last_name) {
    user.username = userData.username ?? user.username;
    user.firstName = userData.first_name ?? user.firstName;
    user.lastName = userData.last_name ?? user.lastName;
    await user.save();
  }

  return user;
}

export async function saveUserInviteLink(userId, inviteLink, chatId) {
  await User.findOneAndUpdate(
    { userId },
    { inviteLink },
    { upsert: true }
  );

  await InviteLink.findOneAndUpdate(
    { inviteLink },
    { userId, chatId: chatId.toString() },
    { upsert: true }
  );
}

export async function getUserByInviteLink(inviteLink) {
  const linkDoc = await InviteLink.findOne({ inviteLink });
  if (!linkDoc) return null;
  return await User.findOne({ userId: linkDoc.userId });
}

export async function recordSuccessfulJoin(joinedUserId, inviterId, rawInviteLink) {
  // Check if member was already counted previously
  const alreadyJoined = await JoinedMember.findOne({ joinedUserId });
  if (alreadyJoined) {
    return { success: false, reason: 'ALREADY_RECORDED' };
  }

  // Record join
  await JoinedMember.create({
    joinedUserId,
    inviterId,
    inviteLink: rawInviteLink,
  });

  // Increment inviter's invite count
  const updatedInviter = await User.findOneAndUpdate(
    { userId: inviterId },
    { $inc: { inviteCount: 1 } },
    { new: true, upsert: true }
  );

  return { success: true, inviter: updatedInviter };
}

export async function getLeaderboard(limit = 10) {
  return await User.find({ inviteCount: { $gt: 0 } })
    .sort({ inviteCount: -1, userId: 1 })
    .limit(limit)
    .lean();
}

export async function getUserStats(userId) {
  const user = await User.findOne({ userId }).lean();
  if (!user) return null;

  // Calculate user rank based on members with strictly higher invite count
  const higherCount = await User.countDocuments({ inviteCount: { $gt: user.inviteCount } });
  const rank = higherCount + 1;

  return {
    ...user,
    rank,
  };
}
