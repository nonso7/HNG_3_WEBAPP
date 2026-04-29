'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Nav from '../Nav';
import { api, ListResponse, Profile, User } from '@/lib/api';

export default function ProfilesPage() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [createName, setCreateName] = useState('');
  const [createMsg, setCreateMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    api<{ data: User }>('/api/users/me').then(r => {
      if (!r.ok || !r.data) router.replace('/login');
      else setUser(r.data.data);
    });
  }, [router]);

  async function load() {
    setLoading(true);
    const q = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort_by: sortBy,
      order,
    });
    if (gender) q.set('gender', gender);
    if (country) q.set('country_id', country);
    if (ageGroup) q.set('age_group', ageGroup);
    const r = await api<ListResponse>(`/api/profiles?${q.toString()}`);
    if (r.ok && r.data) setData(r.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [page, gender, country, ageGroup, sortBy, order]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateMsg('Creating…');
    const r = await api<{ data: Profile }>('/api/profiles', {
      method: 'POST',
      body: JSON.stringify({ name: createName }),
    });
    if (r.ok) {
      setCreateMsg(`Created profile ${r.data?.data?.name}`);
      setCreateName('');
      load();
    } else {
      setCreateMsg(`Error: ${r.error}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this profile?')) return;
    const r = await api(`/api/profiles/${id}`, { method: 'DELETE' });
    if (r.ok) load();
    else alert(r.error);
  }

  async function exportCsv() {
    const q = new URLSearchParams({ format: 'csv' });
    if (gender) q.set('gender', gender);
    if (country) q.set('country_id', country);
    if (ageGroup) q.set('age_group', ageGroup);
    const res = await fetch(`/api/profiles/export?${q.toString()}`, {
      credentials: 'include',
      headers: { 'X-API-Version': '1' },
    });
    if (!res.ok) {
      alert('Export failed: ' + res.status);
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profiles_${new Date().toISOString().replace(/[:.]/g, '')}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Nav />
      <div className="container">
        <h1>Profiles</h1>

        <div className="card">
          <div className="filters">
            <select value={gender} onChange={e => { setGender(e.target.value); setPage(1); }}>
              <option value="">Any gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input
              placeholder="Country (ISO-2)"
              value={country}
              onChange={e => { setCountry(e.target.value.toUpperCase().slice(0, 2)); setPage(1); }}
            />
            <select value={ageGroup} onChange={e => { setAgeGroup(e.target.value); setPage(1); }}>
              <option value="">Any age group</option>
              <option value="child">Child</option>
              <option value="teenager">Teenager</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="created_at">Created</option>
              <option value="age">Age</option>
              <option value="gender_probability">Gender prob</option>
            </select>
            <select value={order} onChange={e => setOrder(e.target.value)}>
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
            <button className="btn-secondary" onClick={exportCsv}>Export CSV</button>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="card">
            <h3>Create profile (admin)</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                placeholder="Name"
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                required
              />
              <button type="submit" disabled={!createName}>Create</button>
            </form>
            {createMsg && <p className="muted">{createMsg}</p>}
          </div>
        )}

        <div className="card">
          {loading && <p className="muted">Loading…</p>}
          {data && (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Gender</th><th>Age</th><th>Group</th><th>Country</th><th>Created</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map(p => (
                    <tr key={p.id}>
                      <td><Link href={`/profile/${p.id}`}>{p.name}</Link></td>
                      <td>{p.gender}</td>
                      <td>{p.age}</td>
                      <td>{p.age_group}</td>
                      <td>{p.country_name} ({p.country_id})</td>
                      <td>{new Date(p.created_at).toLocaleString()}</td>
                      <td>
                        {user?.role === 'admin' && (
                          <button className="btn-secondary" onClick={() => handleDelete(p.id)}>Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pager">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <button disabled={page >= data.total_pages} onClick={() => setPage(p => p + 1)}>Next</button>
                <span className="info">page {data.page} / {data.total_pages} • {data.total.toLocaleString()} total</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
