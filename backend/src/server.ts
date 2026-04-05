import 'dotenv/config';
import app from './app';
import { prisma } from './utils/prisma';

const PORT = process.env.PORT || 4000;

// ── Startup env-var validation ──────────────────────────────────
function validateEnv() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'FRONTEND_URL',
    'REVALIDATION_SECRET',
  ] as const;

  for (const varName of required) {
    if (!process.env[varName]) {
      throw new Error(`❌ Missing env var: ${varName} — check your .env file`);
    }
  }

  console.log('✅ All environment variables present');
}

validateEnv();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
