'use client';
import { useState } from 'react';
import Link from 'next/link';
import Nav from '../Nav';
import { api, ListResponse } from '@/lib/api';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);
    const r = await api<ListResponse>(
      `/api/profiles/search?q=${encodeURIComponent(q)}&limit=20`,
    );
    if (r.ok && r.data) setData(r.data);
    else setError(r.error || 'Search failed');
    setLoading(false);
  }

  return (
    <>
      <Nav />
      <div className="container">
        <h1>Natural-language search</h1>
        <p className="muted">
          Try: <em>young males from nigeria</em>, <em>senior women in south africa</em>,
          <em>males between 25 and 40 from kenya</em>, <em>aged 42</em>.
        </p>
        <form onSubmit={run} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            style={{ flex: 1 }}
            placeholder='Type a query…'
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <button type="submit" disabled={!q || loading}>Search</button>
        </form>
        {error && <p className="error">{error}</p>}
        {loading && <p className="muted">Searching…</p>}
        {data && (
          <div className="card">
            <table>
              <thead>
                <tr><th>Name</th><th>Gender</th><th>Age</th><th>Country</th></tr>
              </thead>
              <tbody>
                {data.data.map(p => (
                  <tr key={p.id}>
                    <td><Link href={`/profile/${p.id}`}>{p.name}</Link></td>
                    <td>{p.gender}</td>
                    <td>{p.age} ({p.age_group})</td>
                    <td>{p.country_name} ({p.country_id})</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="muted" style={{ marginTop: '0.75rem' }}>
              {data.total.toLocaleString()} total matches
            </p>
          </div>
        )}
      </div>
    </>
  );
}
