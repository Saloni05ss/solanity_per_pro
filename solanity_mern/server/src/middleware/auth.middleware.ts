import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { User } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authenticated — missing bearer token');
  }

  const token = header.split(' ')[1];

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.uid);
  if (!user) throw new ApiError(401, 'User no longer exists');

  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  const token = header.split(' ')[1];

  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.uid);
    if (user) {
      req.user = user;
    }
  } catch {
    // Ignore invalid/expired token for optional authentication
  }
  next();
});

