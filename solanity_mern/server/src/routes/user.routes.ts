import { Router } from 'express';
import { getUserProfile, uploadUserAvatar, searchUsers } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadAvatar } from '../middleware/upload.middleware';

const router = Router();

router.get('/search', searchUsers);
router.get('/:uid', getUserProfile);
router.post('/avatar', requireAuth, uploadAvatar.single('avatar'), uploadUserAvatar);

export default router;
