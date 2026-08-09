import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { UserService } from '../services/user.service';

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.getProfile(req.params.uid);
  res.json({ success: true, user });
});

export const uploadUserAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const useravatarurl = await UserService.uploadAvatar(req.user!._id.toString(), req.file);
  res.json({ success: true, useravatarurl });
});
