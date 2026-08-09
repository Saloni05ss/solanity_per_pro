import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ReactionService } from '../services/reaction.service';
import { ReactionType } from '../models/reaction.model';

export const react = asyncHandler(async (req: Request, res: Response) => {
  const { parentType, parentId } = req.params as { parentType: 'post' | 'comment'; parentId: string };
  await ReactionService.react(parentType, parentId, req.user!, req.body.type as ReactionType);
  res.json({ success: true });
});

export const removeReaction = asyncHandler(async (req: Request, res: Response) => {
  const { parentType, parentId } = req.params as { parentType: 'post' | 'comment'; parentId: string };
  await ReactionService.removeReaction(parentType, parentId, req.user!);
  res.json({ success: true });
});

export const listReactions = asyncHandler(async (req: Request, res: Response) => {
  const { parentType, parentId } = req.params as { parentType: 'post' | 'comment'; parentId: string };
  const reactions = await ReactionService.listReactions(parentType, parentId);
  res.json({ success: true, reactions });
});

export const getMyReaction = asyncHandler(async (req: Request, res: Response) => {
  const { parentType, parentId } = req.params as { parentType: 'post' | 'comment'; parentId: string };
  const type = await ReactionService.getMyReaction(parentType, parentId, req.user!._id.toString());
  res.json({ success: true, type });
});
