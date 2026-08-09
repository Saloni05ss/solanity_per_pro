import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthService, toPublicUser } from '../services/auth.service';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  const result = await AuthService.signup(email, password, username);
  res.status(201).json({ success: true, ...result });
});

export const signin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.signin(email, password);
  res.json({ success: true, ...result });
});

export const signout = asyncHandler(async (_req: Request, res: Response) => {
  // Stateless JWT — client just discards the token.
  res.json({ success: true, message: 'Signed out' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, user: toPublicUser(req.user!) });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await AuthService.updateProfile(req.user!._id.toString(), req.body);
  res.json({ success: true, user });
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { credential } = req.body;
  const result = await AuthService.googleAuth(credential);
  res.json({ success: true, ...result });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await AuthService.forgotPassword(email);
  res.json({ success: true, message: 'OTP sent successfully' });
});

export const resetPasswordOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  await AuthService.resetPasswordOtp(email, code, newPassword);
  res.json({ success: true, message: 'Password reset successfully' });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  await AuthService.changePassword(req.user!._id.toString(), oldPassword, newPassword);
  res.json({ success: true, message: 'Password changed successfully' });
});
