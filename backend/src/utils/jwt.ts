import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';

export { Role };

interface TokenPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export const signAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = { expiresIn: '15m' };
  return jwt.sign(payload, process.env.JWT_SECRET!, options);
};

export const signRefreshToken = (payload: Pick<TokenPayload, 'id'>): string => {
  const options: SignOptions = { expiresIn: '7d' };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, options);
};

export const verifyRefreshToken = (token: string): { id: string } => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string };
};

const sharedCookieOptions = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
};

export const cookieOptions = {
  ...sharedCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const clearCookieOptions = sharedCookieOptions;

