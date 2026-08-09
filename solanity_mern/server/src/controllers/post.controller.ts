import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { PostService } from '../services/post.service';

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await PostService.createPost(req.user!._id.toString(), req.body.caption ?? '', req.file);
  res.status(201).json({ success: true, post });
});

export const getFeedPage = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const cursor = req.query.cursor as string | undefined;
  const currentUserId = req.user?._id.toString();
  const result = await PostService.getFeedPage(cursor, limit, currentUserId);
  res.json({ success: true, ...result });
});

export const getUserPosts = asyncHandler(async (req: Request, res: Response) => {
  const currentUserId = req.user?._id.toString();
  const posts = await PostService.getUserPosts(req.params.userId, currentUserId);
  res.json({ success: true, posts });
});

export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await PostService.getPost(req.params.postId);
  res.json({ success: true, post });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  await PostService.deletePost(req.params.postId, req.user!._id.toString());
  res.json({ success: true });
});
