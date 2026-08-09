import { Router } from 'express';
import { createPost, getFeedPage, getUserPosts, getPost, deletePost } from '../controllers/post.controller';
import { addComment, getTopLevelComments } from '../controllers/comment.controller';
import { sharePost } from '../controllers/share.controller';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware';
import { uploadPostMedia } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import { createPostSchema, getFeedSchema, postIdParamSchema, userIdParamSchema } from '../validators/post.validator';
import { addCommentSchema } from '../validators/comment.validator';

const router = Router();

router.get('/feed', optionalAuth, validate(getFeedSchema), getFeedPage);
router.get('/user/:userId', optionalAuth, validate(userIdParamSchema), getUserPosts);
router.get('/:postId', validate(postIdParamSchema), getPost);
router.post('/', requireAuth, uploadPostMedia.single('media'), validate(createPostSchema), createPost);
router.delete('/:postId', requireAuth, validate(postIdParamSchema), deletePost);

router.post('/:postId/share', requireAuth, validate(postIdParamSchema), sharePost);

router.get('/:postId/comments', validate(postIdParamSchema), getTopLevelComments);
router.post('/:postId/comments', requireAuth, validate(addCommentSchema), addComment);

export default router;
