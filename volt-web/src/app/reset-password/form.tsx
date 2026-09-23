'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/nav';

export default function ResetForm() {
  const token = useSearchParams().get('token') ?? '';
  const [pw, setPw] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw.length < 8) { setError('Password must be at least 8 characters.'); return; }
    try {
      const res = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, newPassword: pw }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error((d as { message?: string }).message ?? 'This link expired or is invalid.'); }
      setDone(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'VOLT cannot reach the server.'); }
  }
  return (
    <>
      <SiteHeader />
      <main id="main" className="volt-wrap" style={{ padding: '48px 22px', maxWidth: 520 }}>
        <p className="volt-caps">Recovery</p><h1>Reset password</h1>
        {!token ? <p className="volt-error">Missing reset token. Request a new link.</p> : done ? <div className="volt-card" role="status"><p>Password updated.</p><Link className="volt-btn volt-btn-primary" href="/login">Log in</Link></div> : (
          <form onSubmit={submit}><label className="volt-label" htmlFor="pw">New password</label><input id="pw" className="volt-input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /><div style={{ height: 12 }} />{error ? <p role="alert" className="volt-error">{error}</p> : null}<button className="volt-btn volt-btn-primary">Update password</button></form>
        )}
      </main>
    </>
  );
}
