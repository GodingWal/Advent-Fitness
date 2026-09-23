'use client';
import { useState } from 'react';
import { SiteHeader } from '@/components/nav';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await fetch('/api/auth/password-reset/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      });
      setDone(true);
    } catch { setError('VOLT cannot reach the server. Check your connection and try again.'); }
  }
  return (
    <>
      <SiteHeader />
      <main id="main" className="volt-wrap" style={{ padding: '48px 22px', maxWidth: 520 }}>
        <p className="volt-caps">Recovery</p><h1>Forgot password</h1>
        {done ? <div className="volt-card" role="status"><p>If an account exists for {email}, a reset link was sent. Check your inbox.</p></div> : (
          <form onSubmit={submit}><label className="volt-label" htmlFor="email">Email</label><input id="email" className="volt-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /><div style={{ height: 12 }} />{error ? <p role="alert" className="volt-error">{error}</p> : null}<button className="volt-btn volt-btn-primary">Send reset link</button></form>
        )}
      </main>
    </>
  );
}
