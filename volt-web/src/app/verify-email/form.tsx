'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/nav';

export default function VerifyForm() {
  const token = useSearchParams().get('token') ?? '';
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');
  useEffect(() => {
    if (!token) { setState('fail'); return; }
    fetch('/api/auth/verify-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }),
    }).then((r) => setState(r.ok ? 'ok' : 'fail')).catch(() => setState('fail'));
  }, [token]);
  return (
    <>
      <SiteHeader />
      <main id="main" className="volt-wrap" style={{ padding: '48px 22px', maxWidth: 520 }}>
        <p className="volt-caps">Verification</p><h1>Verify email</h1>
        {state === 'idle' ? <p>Verifying…</p> : state === 'ok' ? <div className="volt-card" role="status"><p>Email verified.</p><Link className="volt-btn volt-btn-primary" href="/app">Open app</Link></div> : <div className="volt-card" role="alert"><p className="volt-error">Your email verification link expired. Request a new one.</p><Link className="volt-btn volt-btn-secondary" href="/login">Back to login</Link></div>}
      </main>
    </>
  );
}
