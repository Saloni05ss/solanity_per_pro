import { CommentDao } from '../dao/comment.dao';
import { PostDao } from '../dao/post.dao';
import { ApiError } from '../utils/ApiError';
import { IUser } from '../models/user.model';

export const CommentService = {
  async addComment(
    postId: string,
    author: IUser,
    text: string,
    parentCommentId?: string,
    replyingToUser?: string
  ) {
    const post = await PostDao.findById(postId);
    if (!post) throw new ApiError(404, 'Post not found');

    let rootCommentId: string | null = null;
    if (parentCommentId) {
      const parent = await CommentDao.findById(parentCommentId);
      if (!parent) throw new ApiError(404, 'Parent comment not found');
      rootCommentId = (parent.rootCommentId ?? parent._id).toString();
      const targetCommentId = parent.rootCommentId ?? parent._id;
      await CommentDao.incrementRepliesCount(targetCommentId, 1);
    }

    const comment = await CommentDao.create({
      postId: postId as any,
      userId: author._id,
      userName: author.username,
      useravatarurl: author.useravatarurl,
      text,
      parentCommentId: (parentCommentId as any) ?? null,
      rootCommentId: rootCommentId as any,
      replyingToUser: replyingToUser ?? null,
    });

    await PostDao.incrementField(postId, 'commentsCount', 1);
    return comment;
  },

  getTopLevelComments(postId: string) {
    return CommentDao.findTopLevelByPost(postId);
  },

  getReplies(commentId: string) {
    return CommentDao.findRepliesByRoot(commentId);
  },

  async deleteComment(commentId: string, requesterId: string) {
    const comment = await CommentDao.findById(commentId);
    if (!comment) throw new ApiError(404, 'Comment not found');
    if (comment.userId.toString() !== requesterId) throw new ApiError(403, 'Not authorized to delete this comment');

    const rootId = comment.parentCommentId ? comment.rootCommentId : comment._id;
    const toDelete = comment.parentCommentId
      ? [comment._id]
      : [comment._id, ...(await CommentDao.findIdsByRoot(rootId!))];

    await CommentDao.deleteMany(toDelete);
    await PostDao.incrementField(comment.postId, 'commentsCount', -toDelete.length);

    if (comment.parentCommentId) {
      const rootId = comment.rootCommentId ?? comment.parentCommentId;
      await CommentDao.incrementRepliesCount(rootId, -1);
    }
  },
};
