'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../Nav';
import { api, ListResponse, User } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState<{ total: number; male: number; female: number } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const me = await api<{ data: User }>('/api/users/me');
      if (!me.ok || !me.data) {
        router.replace('/login');
        return;
      }
      setUser(me.data.data);

      const [all, male, female] = await Promise.all([
        api<ListResponse>('/api/profiles?limit=1'),
        api<ListResponse>('/api/profiles?gender=male&limit=1'),
        api<ListResponse>('/api/profiles?gender=female&limit=1'),
      ]);
      if (all.ok && male.ok && female.ok && all.data && male.data && female.data) {
        setStats({ total: all.data.total, male: male.data.total, female: female.data.total });
      } else {
        setError('Failed to load dashboard metrics');
      }
    })();
  }, [router]);

  return (
    <>
      <Nav />
      <div className="container">
        <h1>Dashboard</h1>
        {user && <p className="muted">Welcome back, @{user.username}.</p>}
        {error && <div className="error">{error}</div>}
        {stats ? (
          <div className="metric-grid">
            <div className="card metric">
              <div className="label">Total profiles</div>
              <div className="value">{stats.total.toLocaleString()}</div>
            </div>
            <div className="card metric">
              <div className="label">Male</div>
              <div className="value">{stats.male.toLocaleString()}</div>
            </div>
            <div className="card metric">
              <div className="label">Female</div>
              <div className="value">{stats.female.toLocaleString()}</div>
            </div>
            <div className="card metric">
              <div className="label">Your role</div>
              <div className="value" style={{ textTransform: 'capitalize' }}>{user?.role ?? '—'}</div>
            </div>
          </div>
        ) : (
          !error && <p className="muted">Loading…</p>
        )}
      </div>
    </>
  );
}
