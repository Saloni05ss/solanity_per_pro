import { Router } from 'express';
import { signup, signin, signout, me, updateProfile, googleAuth, forgotPassword, resetPasswordOtp, changePassword } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { signupSchema, signinSchema, updateProfileSchema } from '../validators/auth.validator';

const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/signin', validate(signinSchema), signin);
router.post('/google', googleAuth);
router.post('/signout', signout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password-otp', resetPasswordOtp);
router.post('/change-password', requireAuth, changePassword);
router.get('/me', requireAuth, me);
router.patch('/profile', requireAuth, validate(updateProfileSchema), updateProfile);

export default router;
