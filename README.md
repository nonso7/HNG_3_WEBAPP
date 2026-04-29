# Insighta Labs+ — Web Portal

Next.js 14 (App Router) + TypeScript. The portal proxies `/api/*` and
`/auth/*` to the Insighta Labs+ backend via Next.js rewrites — that way
HTTP-only auth cookies are set on the portal's origin and CSRF works
seamlessly without cross-site headaches.

## Pages

| Path | Purpose |
| --- | --- |
| `/login` | "Continue with GitHub" button — links to `/auth/github` |
| `/dashboard` | Total / male / female counts, role badge |
| `/profiles` | Filter, sort, paginate, export, create (admin), delete (admin) |
| `/profile/[id]` | Single-profile detail; admin gets a delete button |
| `/search` | Natural-language query box |
| `/account` | Identity panel + sign-out |

## Auth & cookies

- The Login page links to **`/auth/github`** which is rewritten to the
  backend's `/auth/github`. The browser follows redirects to GitHub.
- GitHub redirects to **`/auth/github/callback`** on the **portal's
  origin** (not the backend's). Vercel rewrites pass it to the backend; the
  backend processes the OAuth code, sets `Set-Cookie` headers, and redirects
  to the dashboard. Because the response comes from the portal's origin, the
  browser stores `access_token`, `refresh_token`, and `csrf_token` cookies
  there.
- All subsequent API requests use `credentials: 'include'`, so cookies are
  sent automatically. Non-`GET` requests read the `csrf_token` cookie and
  echo it as `X-CSRF-Token`.
- Token expiry is short (3-min access, 5-min refresh). On a 401 the
  `lib/api.ts` client could be extended to call `/auth/refresh` and retry —
  for now reload triggers the same logic via cookies.

## Configure

`.env.local` (or Vercel env vars):

```
BACKEND_URL=https://be-hng-1.onrender.com
```

That's the only required variable — `next.config.js` reads it for the
rewrites.

## Run locally

```bash
npm install
npm run dev   # http://localhost:3000
```

Visit `http://localhost:3000`. The portal proxies API/auth calls to the URL
in `BACKEND_URL`.

For the GitHub OAuth callback to land on the portal's origin during local
development, register a separate OAuth App with callback URL
`http://localhost:3000/auth/github/callback` (see backend deployment notes).

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Add env var `BACKEND_URL` = your Railway backend URL.
4. Deploy. The Vercel URL becomes your portal URL.
5. Update the GitHub OAuth App's callback URL to
   `https://<vercel-url>/auth/github/callback`.
6. Update the backend's `GITHUB_REDIRECT_URI` env var to match.
7. Update the backend's `WEB_APP_URL` to `https://<vercel-url>/dashboard`.

## Project layout

```
app/
  layout.tsx          shell + global styles
  globals.css         dark theme
  Nav.tsx             nav bar (loads /api/users/me)
  page.tsx            redirects to /dashboard or /login
  login/page.tsx      "Continue with GitHub" button
  dashboard/page.tsx  metrics
  profiles/page.tsx   list + filters + create + delete + export
  profile/[id]/page.tsx
  search/page.tsx     NL search
  account/page.tsx    identity + sign-out
lib/
  api.ts              fetch wrapper with credentials + CSRF + types
next.config.js        rewrites /api/* and /auth/* to backend
```

## CI

`.github/workflows/ci.yml` runs lint, typecheck, and `next build` on every
PR and push to `main`.
# HNG_3_WEBAPP
