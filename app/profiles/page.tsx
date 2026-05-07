'use client';
import { useEffect, useRef, useState } from 'react';
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
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [importSummary, setImportSummary] = useState<{
    total_rows: number;
    inserted: number;
    skipped: number;
    reasons: Record<string, number>;
  } | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
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

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!importFile) return;
    setImporting(true);
    setImportMsg('Uploading…');
    setImportSummary(null);

    const fd = new FormData();
    fd.append('file', importFile);

    const csrf = document.cookie
      .split(';')
      .map(s => s.trim())
      .find(s => s.startsWith('csrf_token='));
    const csrfToken = csrf ? decodeURIComponent(csrf.slice('csrf_token='.length)) : '';

    const headers: Record<string, string> = { 'X-API-Version': '1' };
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

    let res: Response;
    try {
      res = await fetch('/api/profiles/import', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: fd,
      });
    } catch {
      setImporting(false);
      setImportMsg('Network error — backend unreachable');
      return;
    }

    let body: any = null;
    try { body = await res.json(); } catch {}

    setImporting(false);
    if (!res.ok) {
      setImportMsg(`Error: ${body?.message || `HTTP ${res.status}`}`);
      return;
    }
    setImportSummary({
      total_rows: body?.total_rows ?? 0,
      inserted: body?.inserted ?? 0,
      skipped: body?.skipped ?? 0,
      reasons: body?.reasons ?? {},
    });
    setImportMsg(`Imported ${body?.inserted ?? 0} of ${body?.total_rows ?? 0} rows.`);
    setImportFile(null);
    if (importInputRef.current) importInputRef.current.value = '';
    load();
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

        {user?.role === 'admin' && (
          <div className="card">
            <h3>Import CSV (admin)</h3>
            <p className="muted" style={{ marginTop: 0 }}>
              Required columns: <code>name, gender, age, country_id</code>.
              Optional: <code>gender_probability, country_probability</code>.
              Up to 500,000 rows per file.
            </p>
            <form onSubmit={handleImport} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                id="import-file-input"
                ref={importInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={e => setImportFile(e.target.files?.[0] ?? null)}
                disabled={importing}
                required
              />
              <button type="submit" disabled={!importFile || importing}>
                {importing ? 'Importing…' : 'Import'}
              </button>
            </form>
            {importMsg && <p className="muted">{importMsg}</p>}
            {importSummary && (
              <div style={{ marginTop: '0.5rem' }}>
                <table>
                  <tbody>
                    <tr><th>Total rows</th><td>{importSummary.total_rows.toLocaleString()}</td></tr>
                    <tr><th>Inserted</th><td>{importSummary.inserted.toLocaleString()}</td></tr>
                    <tr><th>Skipped</th><td>{importSummary.skipped.toLocaleString()}</td></tr>
                  </tbody>
                </table>
                {Object.keys(importSummary.reasons).length > 0 && (
                  <>
                    <h4 style={{ marginBottom: '0.25rem' }}>Skip reasons</h4>
                    <table>
                      <tbody>
                        {Object.entries(importSummary.reasons).map(([reason, count]) => (
                          <tr key={reason}><th>{reason}</th><td>{count.toLocaleString()}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}
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
