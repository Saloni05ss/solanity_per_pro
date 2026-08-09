import jwt, { SignOptions } from 'jsonwebtoken';

export function signToken(uid: string): string {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
  return jwt.sign({ uid }, secret, { expiresIn });
}

export function verifyToken(token: string): { uid: string } {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret) as { uid: string };
}
