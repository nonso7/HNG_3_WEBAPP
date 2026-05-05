'use client';

// Bypass the Next.js /auth/* rewrite for the OAuth kick-off so the browser
// gets the backend's 302→github.com response directly, with no proxy hop in
// the way. The OAuth callback (/auth/github/callback) still goes through the
// rewrite, so cookies land on this domain as before.
const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://be-hng-1.onrender.com';

export default function LoginPage() {
  return (
    <div className="login-screen">
      <h1>Insighta Labs+</h1>
      <p>
        Profile intelligence platform. Sign in with GitHub to query, search,
        export, and manage profiles.
      </p>
      <a className="btn gh-btn" href={`${BACKEND}/auth/github`} rel="noopener">
        Continue with GitHub →
      </a>
    </div>
  );
}
