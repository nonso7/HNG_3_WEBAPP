'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../Nav';
import { api, logout, User } from '@/lib/api';

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    api<{ data: User }>('/api/users/me').then(r => {
      if (!r.ok || !r.data) router.replace('/login');
      else setUser(r.data.data);
    });
  }, [router]);

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  if (!user) return null;

  return (
    <>
      <Nav />
      <div className="container">
        <h1>Account</h1>
        <div className="card">
          <table>
            <tbody>
              <tr><th>Username</th><td>@{user.username}</td></tr>
              <tr><th>ID</th><td>{user.id}</td></tr>
              <tr><th>Role</th><td>{user.role}</td></tr>
              <tr><th>Email</th><td>{user.email || '—'}</td></tr>
              <tr><th>Active</th><td>{user.is_active ? 'Yes' : 'No'}</td></tr>
              <tr>
                <th>Last login</th>
                <td>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : '—'}</td>
              </tr>
              <tr>
                <th>Created</th>
                <td>{new Date(user.created_at).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button className="btn-secondary" onClick={handleLogout}>Sign out</button>
      </div>
    </>
  );
}
