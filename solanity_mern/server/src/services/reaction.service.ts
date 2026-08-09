import mongoose, { Model } from 'mongoose';
import { ReactionDao } from '../dao/reaction.dao';
import { Post, IPost } from '../models/post.model';
import { Comment, IComment } from '../models/comment.model';
import { ApiError } from '../utils/ApiError';
import { ReactionType } from '../models/reaction.model';
import { IUser } from '../models/user.model';

type ParentType = 'post' | 'comment';
type ParentDoc = IPost | IComment;

function parentModel(parentType: ParentType): Model<ParentDoc> {
  return (parentType === 'post' ? Post : Comment) as unknown as Model<ParentDoc>;
}

function sumCounts(counts: Record<string, number>): number {
  return Object.values(counts).reduce((a, b) => a + b, 0);
}

export const ReactionService = {
  /** Transaction-based react — mirrors reaction.service.dart's runTransaction. */
  async react(parentType: ParentType, parentId: string, user: IUser, type: ReactionType) {
    const Model = parentModel(parentType);
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const parent = await Model.findById(parentId).session(session);
        if (!parent) throw new ApiError(404, `${parentType} not found`);

        const existing = await ReactionDao.findOne(parentType, parentId, user._id, session);
        const counts: Record<string, number> = Object.fromEntries((parent.reactionsCount as Map<string, number>) ?? []);

        if (existing) {
          counts[existing.type] = Math.max(0, (counts[existing.type] ?? 1) - 1);
          await ReactionDao.updateType(existing, type, session);
        } else {
          await ReactionDao.create(
            { parentType, parentId: parentId as any, userId: user._id, userName: user.username, useravatarurl: user.useravatarurl, type },
            session
          );
        }
        counts[type] = (counts[type] ?? 0) + 1;

        parent.reactionsCount = counts as any;
        parent.likesCount = sumCounts(counts);
        await parent.save({ session });
      });
    } finally {
      session.endSession();
    }
  },

  async removeReaction(parentType: ParentType, parentId: string, user: IUser) {
    const Model = parentModel(parentType);
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const existing = await ReactionDao.findOne(parentType, parentId, user._id, session);
        if (!existing) return;

        const parent = await Model.findById(parentId).session(session);
        if (!parent) return;

        const counts: Record<string, number> = Object.fromEntries((parent.reactionsCount as Map<string, number>) ?? []);
        counts[existing.type] = Math.max(0, (counts[existing.type] ?? 1) - 1);

        await ReactionDao.deleteOne(existing._id, session);

        parent.reactionsCount = counts as any;
        parent.likesCount = sumCounts(counts);
        await parent.save({ session });
      });
    } finally {
      session.endSession();
    }
  },

  listReactions(parentType: ParentType, parentId: string) {
    return ReactionDao.findByParent(parentType, parentId);
  },

  async getMyReaction(parentType: ParentType, parentId: string, userId: string) {
    const reaction = await ReactionDao.findOne(parentType, parentId, userId);
    return reaction?.type ?? null;
  },
};
