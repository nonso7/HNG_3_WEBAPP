function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : '';
}

export async function api<T = any>(
  path: string,
  init: RequestInit = {},
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const headers: Record<string, string> = {
    'X-API-Version': '1',
    ...(init.headers as Record<string, string> | undefined),
  };
  const method = (init.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    const csrf = getCookie('csrf_token');
    if (csrf) headers['X-CSRF-Token'] = csrf;
    if (init.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(path, {
    credentials: 'include',
    ...init,
    headers,
  });
  const contentType = res.headers.get('content-type') || '';
  let data: any = null;
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    data = await res.text();
  }
  if (!res.ok) {
    return { ok: false, status: res.status, data: null, error: data?.message || `HTTP ${res.status}` };
  }
  return { ok: true, status: res.status, data };
}

export async function logout() {
  await api('/auth/logout', { method: 'POST', body: JSON.stringify({}) });
}

export type Profile = {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  age: number;
  age_group: string;
  country_id: string;
  country_name: string;
  country_probability: number;
  created_at: string;
};

export type ListResponse = {
  status: string;
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  links: { self: string; next: string | null; prev: string | null };
  data: Profile[];
};

export type User = {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
};
