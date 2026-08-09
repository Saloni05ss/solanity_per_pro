import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ShareService } from '../services/share.service';

export const sharePost = asyncHandler(async (req: Request, res: Response) => {
  const sharesCount = await ShareService.sharePost(req.params.postId);
  res.json({ success: true, sharesCount });
});
