'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        // Read token from URL hash
        const hash = window.location.hash;
        const token = hash.startsWith('#token=') ? hash.slice(7) : null;

        if (!token) {
          router.replace('/login?error=oauth_failed');
          return;
        }

        // Store token in localStorage
        localStorage.setItem('accessToken', token);

        // Verify token by calling /auth/me with Bearer header
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          router.replace('/login?error=oauth_failed');
          return;
        }

        router.replace('/admin');
      } catch {
        router.replace('/login?error=oauth_failed');
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Signing you in...</p>
    </div>
  );
}
