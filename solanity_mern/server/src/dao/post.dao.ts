import { ClientSession, Types } from 'mongoose';
import { Post, IPost } from '../models/post.model';

export const PostDao = {
  create(data: Partial<IPost>) {
    return Post.create(data);
  },

  findById(id: string | Types.ObjectId, session?: ClientSession) {
    return Post.findById(id).session(session ?? null);
  },

  findByIdPopulated(id: string | Types.ObjectId) {
    return Post.findById(id).populate('userId', 'username useravatarurl');
  },

  findFeedPage(beforeDate: Date | undefined, limit: number) {
    const filter = beforeDate ? { createdAt: { $lt: beforeDate } } : {};
    return Post.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'username useravatarurl');
  },

  findByUser(userId: string | Types.ObjectId) {
    return Post.find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username useravatarurl');
  },

  deleteById(id: string | Types.ObjectId) {
    return Post.deleteOne({ _id: id });
  },

  incrementField(id: string | Types.ObjectId, field: 'commentsCount' | 'sharesCount', amount: number) {
    return Post.findByIdAndUpdate(id, { $inc: { [field]: amount } }, { new: true });
  },

  save(post: IPost, session?: ClientSession) {
    return post.save({ session });
  },
};
