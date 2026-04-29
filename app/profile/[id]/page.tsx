'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Nav from '../../Nav';
import { api, Profile, User } from '@/lib/api';

export default function ProfileDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [p, setP] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ data: User }>('/api/users/me').then(r => {
      if (!r.ok || !r.data) router.replace('/login');
      else setUser(r.data.data);
    });
  }, [router]);

  useEffect(() => {
    if (!params?.id) return;
    api<{ data: Profile }>(`/api/profiles/${params.id}`).then(r => {
      if (r.ok && r.data) setP(r.data.data);
      else setError(r.error || 'Not found');
    });
  }, [params?.id]);

  async function handleDelete() {
    if (!confirm('Delete this profile?')) return;
    const r = await api(`/api/profiles/${params.id}`, { method: 'DELETE' });
    if (r.ok) router.push('/profiles');
    else alert(r.error);
  }

  return (
    <>
      <Nav />
      <div className="container">
        {error && <p className="error">{error}</p>}
        {p && (
          <div className="card">
            <h1>{p.name}</h1>
            <table>
              <tbody>
                <tr><th>ID</th><td>{p.id}</td></tr>
                <tr><th>Gender</th><td>{p.gender} ({p.gender_probability.toFixed(2)})</td></tr>
                <tr><th>Age</th><td>{p.age}</td></tr>
                <tr><th>Age group</th><td>{p.age_group}</td></tr>
                <tr><th>Country</th><td>{p.country_name} ({p.country_id}, {p.country_probability.toFixed(2)})</td></tr>
                <tr><th>Created</th><td>{new Date(p.created_at).toLocaleString()}</td></tr>
              </tbody>
            </table>
            {user?.role === 'admin' && (
              <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={handleDelete}>
                Delete profile
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
