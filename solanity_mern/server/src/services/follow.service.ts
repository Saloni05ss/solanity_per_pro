import mongoose from 'mongoose';
import { FollowDao } from '../dao/follow.dao';
import { UserDao } from '../dao/user.dao';
import { ApiError } from '../utils/ApiError';
import { Follow } from '../models/follow.model';

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

  async getFollowers(userId: string, viewerId?: string) {
    const follows = await FollowDao.findFollowers(userId);
    const users = follows.map((f) => f.followerId).filter(Boolean);

    if (!viewerId) {
      return users.map((u: any) => ({
        _id: u._id,
        username: u.username,
        useravatarurl: u.useravatarurl,
        isFollowing: false,
      }));
    }

    const userIds = users.map((u: any) => u._id);
    const viewerFollows = await Follow.find({
      followerId: viewerId,
      followingId: { $in: userIds }
    }).distinct('followingId');
    const followedSet = new Set(viewerFollows.map((id) => id.toString()));

    return users.map((u: any) => ({
      _id: u._id,
      username: u.username,
      useravatarurl: u.useravatarurl,
      isFollowing: followedSet.has(u._id.toString()),
    }));
  },

  async getFollowing(userId: string, viewerId?: string) {
    const follows = await FollowDao.findFollowing(userId);
    const users = follows.map((f) => f.followingId).filter(Boolean);

    if (!viewerId) {
      return users.map((u: any) => ({
        _id: u._id,
        username: u.username,
        useravatarurl: u.useravatarurl,
        isFollowing: false,
      }));
    }

    const userIds = users.map((u: any) => u._id);
    const viewerFollows = await Follow.find({
      followerId: viewerId,
      followingId: { $in: userIds }
    }).distinct('followingId');
    const followedSet = new Set(viewerFollows.map((id) => id.toString()));

    return users.map((u: any) => ({
      _id: u._id,
      username: u.username,
      useravatarurl: u.useravatarurl,
      isFollowing: followedSet.has(u._id.toString()),
    }));
  },
};
