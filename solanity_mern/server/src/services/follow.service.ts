import mongoose from 'mongoose';
import { FollowDao } from '../dao/follow.dao';
import { UserDao } from '../dao/user.dao';
import { ApiError } from '../utils/ApiError';

export const FollowService = {
  /** Mirrors follow.service.dart's batch write: create follow doc + bump both counters atomically. */
  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) throw new ApiError(400, "You can't follow yourself");

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await FollowDao.create(followerId, followingId, session);
        await UserDao.incrementCounts(followerId, { followingCount: 1 }, session);
        await UserDao.incrementCounts(followingId, { followersCount: 1 }, session);
      });
    } finally {
      session.endSession();
    }
  },

  async unfollow(followerId: string, followingId: string) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const deleted = await FollowDao.findOneAndDelete(followerId, followingId, session);
        if (deleted) {
          await UserDao.incrementCounts(followerId, { followingCount: -1 }, session);
          await UserDao.incrementCounts(followingId, { followersCount: -1 }, session);
        }
      });
    } finally {
      session.endSession();
    }
  },

  async isFollowing(followerId: string, followingId: string) {
    return !!(await FollowDao.exists(followerId, followingId));
  },

  async getFollowers(userId: string) {
    const follows = await FollowDao.findFollowers(userId);
    return follows.map((f) => f.followerId);
  },

  async getFollowing(userId: string) {
    const follows = await FollowDao.findFollowing(userId);
    return follows.map((f) => f.followingId);
  },
};
