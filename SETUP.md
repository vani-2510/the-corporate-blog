# The Corporate Blog — Setup Guide

## Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** (local or [Neon](https://neon.tech) hosted)
- **Google Cloud** OAuth 2.0 credentials ([console](https://console.cloud.google.com/apis/credentials))
- **Cloudinary** account for image uploads ([dashboard](https://cloudinary.com/console))

---

## 1. Clone the Repo

```bash
git clone https://github.com/YOUR_USERNAME/the-corporate-blog.git
cd the-corporate-blog
```

---

## 2. Environment Variables

### Backend

Copy the example file, then fill in your real values:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `DATABASE_URL` | PostgreSQL connection string (Prisma) | `postgresql://user:pass@localhost:5432/blog` |
| `JWT_SECRET` | Access token signing key (`jwt.ts`) | — |
| `JWT_REFRESH_SECRET` | Refresh token signing key | — |
| `JWT_EXPIRES_IN` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | — |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | — |
| `GOOGLE_CALLBACK_URL` | OAuth redirect URI | `http://localhost:4000/auth/google/callback` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | — |
| `CLOUDINARY_API_KEY` | Cloudinary API key | — |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | — |
| `FRONTEND_URL` | Next.js app URL (used for OAuth redirects & ISR) | `http://localhost:3000` |
| `REVALIDATION_SECRET` | Shared secret for ISR revalidation | — |
| `PORT` | Express server port | `4000` |
| `NODE_ENV` | Environment mode | `development` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `http://localhost:3000` |

> The server validates all required env vars at startup. If any are missing, it throws:
> `❌ Missing env var: <NAME> — check your .env file`

### Frontend

Copy the example file, then fill in your real values:

```bash
cp frontend/.env.example frontend/.env.local
```

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:4000` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (SEO/sitemap) | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_NAME` | Site name (metadata) | `The Corporate Blog` |
| `REVALIDATION_SECRET` | Must match backend value | — |

---

## 3. Install & Run

### Mac / Linux

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
npx prisma db push        # sync schema to DB
npm run dev

# Frontend (new terminal)
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Windows (CMD)

```cmd
:: Backend
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install
npx prisma generate
npx prisma db push
npm run dev

:: Frontend (new terminal)
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
npm run dev
```

### Windows (PowerShell)

```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend (new terminal)
cd frontend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
npm run dev
```

---

## 4. Verify It Works

| Check | URL |
|-------|-----|
| Backend is running | http://localhost:4000 |
| Blog homepage | http://localhost:3000/blog |
| Admin panel (requires login) | http://localhost:3000/admin |
| Prisma Studio (DB browser) | Run `cd backend && npx prisma studio` |

---

## 5. Production Deployment

When deploying to production, change these env vars:

### Backend `.env` changes

| Variable | Dev Value | Prod Value | What Breaks If Wrong |
|----------|-----------|------------|---------------------|
| `GOOGLE_CALLBACK_URL` | `http://localhost:4000/auth/google/callback` | `https://api.yourdomain.com/auth/google/callback` | Google OAuth returns error — users can't log in |
| `FRONTEND_URL` | `http://localhost:3000` | `https://yourdomain.com` | OAuth redirects go to localhost; ISR revalidation fails |
| `NODE_ENV` | `development` | `production` | Stack traces leak to clients (security); Prisma verbose logging stays on |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | `https://yourdomain.com` | CORS blocks all frontend API requests |
| `DATABASE_URL` | local/Neon dev | production DB URL | Wrong database |

### Frontend `.env.local` changes

| Variable | Dev Value | Prod Value | What Breaks If Wrong |
|----------|-----------|------------|---------------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | `https://api.yourdomain.com` | All API calls fail — no posts load, login breaks |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://yourdomain.com` | Sitemap and OG meta tags point to wrong domain (SEO) |

### Where each variable is used in code

| Variable | Files that read it |
|----------|-------------------|
| `DATABASE_URL` | `prisma/schema.prisma` (via Prisma) |
| `JWT_SECRET` | `jwt.ts`, `auth.middleware.ts` |
| `JWT_REFRESH_SECRET` | `jwt.ts` |
| `GOOGLE_CLIENT_ID` | `auth.routes.ts` (OAuth2Client constructor + token verify) |
| `GOOGLE_CLIENT_SECRET` | `auth.routes.ts` (OAuth2Client constructor) |
| `GOOGLE_CALLBACK_URL` | `auth.routes.ts` (OAuth2Client redirect URI) |
| `CLOUDINARY_*` | `images.routes.ts` (Cloudinary SDK config) |
| `FRONTEND_URL` | `auth.routes.ts` (redirect URLs), `posts.routes.ts` (ISR) |
| `REVALIDATION_SECRET` | `posts.routes.ts` (backend), `api/revalidate/route.ts` (frontend) |
| `NODE_ENV` | `jwt.ts` (secure cookies), `error.middleware.ts` (error detail), `prisma.ts` (logging) |
| `ALLOWED_ORIGINS` | `app.ts` (CORS config) |
| `PORT` | `server.ts` |
| `NEXT_PUBLIC_API_URL` | `lib/api.ts`, `login/page.tsx`, `admin/page.tsx`, `admin/posts/page.tsx`, `admin/posts/new/page.tsx`, `admin/posts/[id]/edit/page.tsx`, `admin/categories/page.tsx` |
| `NEXT_PUBLIC_SITE_URL` | `layout.tsx`, `sitemap.ts`, `robots.ts`, `JsonLd.tsx`, `category/[slug]/page.tsx` |
| `NEXT_PUBLIC_SITE_NAME` | `layout.tsx`, `JsonLd.tsx` |

---

## 6. Pre-Deploy Checklist

- [ ] All backend env vars set in hosting platform
- [ ] All frontend env vars set in hosting platform
- [ ] `GOOGLE_CALLBACK_URL` updated to production domain
- [ ] `FRONTEND_URL` updated to production domain
- [ ] `ALLOWED_ORIGINS` updated to production domain
- [ ] `NEXT_PUBLIC_API_URL` updated to production backend URL
- [ ] `NEXT_PUBLIC_SITE_URL` updated to production frontend URL
- [ ] `NODE_ENV` set to `production`
- [ ] `REVALIDATION_SECRET` matches between backend and frontend
- [ ] Google OAuth Console: production redirect URI added
- [ ] `prisma generate` runs on deploy (via `postinstall` script)
- [ ] Database migrated (`prisma db push` or `prisma migrate deploy`)
- [ ] HTTPS configured for both frontend and backend
- [ ] Test login flow end-to-end
- [ ] Test image upload
- [ ] Test blog post publish + revalidation
