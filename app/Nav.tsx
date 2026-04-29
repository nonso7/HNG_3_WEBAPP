'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, logout, User } from '@/lib/api';

export default function Nav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api<{ status: string; data: User }>('/api/users/me').then(r => {
      if (r.ok && r.data) setUser(r.data.data);
      setLoading(false);
    });
  }, []);

  async function handleLogout() {
    await logout();
    setUser(null);
    router.push('/login');
  }

  if (loading) return null;

  return (
    <nav className="nav">
      <Link href="/dashboard"><strong>Insighta Labs+</strong></Link>
      <Link href="/profiles">Profiles</Link>
      <Link href="/search">Search</Link>
      <Link href="/account">Account</Link>
      <span className="spacer" />
      {user ? (
        <>
          <span className={`role-badge ${user.role === 'analyst' ? 'analyst' : ''}`}>{user.role}</span>
          <span className="muted">@{user.username}</span>
          <button className="btn-secondary" onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Link href="/login">Login</Link>
      )}
    </nav>
  );
}
