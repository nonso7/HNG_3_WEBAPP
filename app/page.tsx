'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    api('/api/users/me')
      .then(r => router.replace(r.ok ? '/dashboard' : '/login'))
      .catch(() => router.replace('/login'));
  }, [router]);

  return (
    <div className="login-screen">
      <p className="muted">Loading…</p>
    </div>
  );
}
