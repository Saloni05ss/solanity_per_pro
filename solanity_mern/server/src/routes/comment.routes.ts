import { Router } from 'express';
import { getReplies, deleteComment } from '../controllers/comment.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { commentIdParamSchema } from '../validators/comment.validator';

const router = Router();

router.get('/:commentId/replies', validate(commentIdParamSchema), getReplies);
router.delete('/:commentId', requireAuth, validate(commentIdParamSchema), deleteComment);

export default router;
