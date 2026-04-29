'use client';

export default function LoginPage() {
  return (
    <div className="login-screen">
      <h1>Insighta Labs+</h1>
      <p>
        Profile intelligence platform. Sign in with GitHub to query, search, export, and manage profiles.
      </p>
      <a className="btn gh-btn" href="/auth/github">
        Continue with GitHub →
      </a>
    </div>
  );
}
