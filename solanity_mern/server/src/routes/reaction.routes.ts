import { Router } from 'express';
import { react, removeReaction, listReactions, getMyReaction } from '../controllers/reaction.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { reactSchema, reactionParamSchema } from '../validators/reaction.validator';

const router = Router({ mergeParams: true });

// parentType = 'post' | 'comment'
router.post('/:parentType/:parentId', requireAuth, validate(reactSchema), react);
router.delete('/:parentType/:parentId', requireAuth, validate(reactionParamSchema), removeReaction);
router.get('/:parentType/:parentId', validate(reactionParamSchema), listReactions);
router.get('/:parentType/:parentId/mine', requireAuth, validate(reactionParamSchema), getMyReaction);

export default router;
