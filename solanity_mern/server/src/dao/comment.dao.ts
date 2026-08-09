import { Types } from 'mongoose';
import { Comment, IComment } from '../models/comment.model';

export const CommentDao = {
  create(data: Partial<IComment>) {
    return Comment.create(data);
  },

  findById(id: string | Types.ObjectId) {
    return Comment.findById(id);
  },

  findTopLevelByPost(postId: string | Types.ObjectId) {
    return Comment.find({ postId, parentCommentId: null }).sort({ createdAt: -1 });
  },

  findRepliesByRoot(rootCommentId: string | Types.ObjectId) {
    return Comment.find({ rootCommentId }).sort({ createdAt: 1 });
  },

  findIdsByRoot(rootCommentId: string | Types.ObjectId) {
    return Comment.find({ rootCommentId }).distinct('_id');
  },

  deleteMany(ids: (string | Types.ObjectId)[]) {
    return Comment.deleteMany({ _id: { $in: ids } });
  },

  deleteAllForPost(postId: string | Types.ObjectId) {
    return Comment.deleteMany({ postId });
  },

  incrementRepliesCount(id: string | Types.ObjectId, amount: number) {
    return Comment.updateOne({ _id: id }, { $inc: { repliesCount: amount } });
  },
};
