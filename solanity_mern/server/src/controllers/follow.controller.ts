import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { FollowService } from '../services/follow.service';

export const followUser = asyncHandler(async (req: Request, res: Response) => {
  await FollowService.follow(req.user!._id.toString(), req.params.followingId);
  res.status(201).json({ success: true });
});

export const unfollowUser = asyncHandler(async (req: Request, res: Response) => {
  await FollowService.unfollow(req.user!._id.toString(), req.params.followingId);
  res.json({ success: true });
});

export const isFollowing = asyncHandler(async (req: Request, res: Response) => {
  const result = await FollowService.isFollowing(req.user!._id.toString(), req.params.followingId);
  res.json({ success: true, isFollowing: result });
});

export const getFollowers = asyncHandler(async (req: Request, res: Response) => {
  const users = await FollowService.getFollowers(req.params.userId);
  res.json({ success: true, users });
});

export const getFollowing = asyncHandler(async (req: Request, res: Response) => {
  const users = await FollowService.getFollowing(req.params.userId);
  res.json({ success: true, users });
});
