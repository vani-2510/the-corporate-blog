import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../utils/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken, cookieOptions, clearCookieOptions } from '../utils/jwt';
import { generateUserSlug } from '../utils/slug';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { z } from 'zod';

const router = Router();

// OAuth2 client for redirect-based flow (browser login)
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

// Legacy idToken client (for API usage)
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Google OAuth Redirect Flow ─────────────────────────────────

// GET /auth/google — redirect browser to Google consent screen
router.get('/google', (_req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'select_account',
  });
  res.redirect(url);
});

// GET /auth/google/callback — Google calls this after user consents
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    if (!code) return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);

    const { tokens } = await oauth2Client.getToken(code);
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const googlePayload = ticket.getPayload();
    if (!googlePayload?.email) return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_token`);

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId: googlePayload.sub }, { email: googlePayload.email }] },
    });

    if (!user) {
      // Auto-create if first login (role = WRITER). ADMIN must be set manually.
      const slug = await generateUserSlug(googlePayload.name || googlePayload.email);
      user = await prisma.user.create({
        data: {
          email: googlePayload.email,
          name: googlePayload.name || googlePayload.email,
          googleId: googlePayload.sub,
          avatar: googlePayload.picture,
          slug,
          role: 'WRITER',
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googlePayload.sub, avatar: googlePayload.picture },
      });
    }

    const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: user.id });

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback#token=${accessToken}`);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

// GET /auth/me
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({
    user: req.user,
    accessToken: req.cookies?.accessToken || null,
  });
});



const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, password: true },
    });

    if (!user || !user.password) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: user.id });

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.json({ user: payload, accessToken });
  } catch (error) {
    next(error);
  }
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError('No refresh token', 401);

    const { id } = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, name: true, refreshToken: true },
    });

    if (!user || user.refreshToken !== token) throw new AppError('Invalid refresh token', 401);

    const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const accessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken({ id: user.id });

    await prisma.user.update({ where: { id }, data: { refreshToken: newRefreshToken } });

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
});

// POST /auth/google — verify Google ID token
router.post('/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = z.object({ idToken: z.string() }).parse(req.body);

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const googlePayload = ticket.getPayload();
    if (!googlePayload?.email) throw new AppError('Invalid Google token', 400);

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId: googlePayload.sub }, { email: googlePayload.email }] },
    });

    if (!user) {
      const slug = await generateUserSlug(googlePayload.name || googlePayload.email);
      user = await prisma.user.create({
        data: {
          email: googlePayload.email,
          name: googlePayload.name || googlePayload.email,
          googleId: googlePayload.sub,
          avatar: googlePayload.picture,
          slug,
          role: 'WRITER',
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googlePayload.sub, avatar: googlePayload.picture },
      });
    }

    const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: user.id });

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.json({ user: payload, accessToken });
  } catch (error) {
    next(error);
  }
});

// POST /auth/logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const { id } = verifyRefreshToken(token);
        await prisma.user.update({ where: { id }, data: { refreshToken: null } });
      } catch { /* ignore */ }
    }
    res.clearCookie('accessToken', clearCookieOptions);
    res.clearCookie('refreshToken', clearCookieOptions);
    res.json({ message: 'Logged out' });
  } catch (error) {
    next(error);
  }
});

export default router;
