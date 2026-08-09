import { ClientSession, Types } from 'mongoose';
import { Follow } from '../models/follow.model';

export const FollowDao = {
  create(followerId: string | Types.ObjectId, followingId: string | Types.ObjectId, session?: ClientSession) {
    return Follow.create([{ followerId, followingId }], { session }).then((docs) => docs[0]);
  },

  findOneAndDelete(followerId: string | Types.ObjectId, followingId: string | Types.ObjectId, session?: ClientSession) {
    return Follow.findOneAndDelete({ followerId, followingId }, { session });
  },

  exists(followerId: string | Types.ObjectId, followingId: string | Types.ObjectId) {
    return Follow.exists({ followerId, followingId });
  },

  findFollowers(userId: string | Types.ObjectId) {
    return Follow.find({ followingId: userId }).populate('followerId', 'username useravatarurl');
  },

  findFollowing(userId: string | Types.ObjectId) {
    return Follow.find({ followerId: userId }).populate('followingId', 'username useravatarurl');
  },
};
