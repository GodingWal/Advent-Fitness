'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Step() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  async function finish() {
    try {
      const res = await fetch('/api/volt/v1/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ onboardingCompleted: true }) });
      if (!res.ok) throw new Error('Could not complete onboarding.');
      router.push('/app'); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'VOLT cannot reach the server.'); }
  }
  return (<><h1>You are set.</h1><div className="volt-card"><p style={{ color: 'var(--volt-text-mute)' }}>Training target, goal, activities and home gym are saved to your profile. You can change them anytime under Profile.</p><button className="volt-btn volt-btn-primary" onClick={finish}>Open dashboard</button>{error ? <p role="alert" className="volt-error">{error}</p> : null}</div></>);
}
