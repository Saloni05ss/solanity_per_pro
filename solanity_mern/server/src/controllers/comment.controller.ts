import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { CommentService } from '../services/comment.service';

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const { text, parentCommentId, replyingToUser } = req.body;
  const comment = await CommentService.addComment(req.params.postId, req.user!, text, parentCommentId, replyingToUser);
  res.status(201).json({ success: true, comment });
});

export const getTopLevelComments = asyncHandler(async (req: Request, res: Response) => {
  const comments = await CommentService.getTopLevelComments(req.params.postId);
  res.json({ success: true, comments });
});

export const getReplies = asyncHandler(async (req: Request, res: Response) => {
  const replies = await CommentService.getReplies(req.params.commentId);
  res.json({ success: true, replies });
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  await CommentService.deleteComment(req.params.commentId, req.user!._id.toString());
  res.json({ success: true });
});
