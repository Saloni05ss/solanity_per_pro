import { Router } from 'express';
import { followUser, unfollowUser, isFollowing, getFollowers, getFollowing } from '../controllers/follow.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { followingIdParamSchema, userIdParamSchema } from '../validators/follow.validator';

const router = Router();

router.post('/:followingId', requireAuth, validate(followingIdParamSchema), followUser);
router.delete('/:followingId', requireAuth, validate(followingIdParamSchema), unfollowUser);
router.get('/:followingId/is-following', requireAuth, validate(followingIdParamSchema), isFollowing);
router.get('/:userId/followers', validate(userIdParamSchema), getFollowers);
router.get('/:userId/following', validate(userIdParamSchema), getFollowing);

export default router;
