'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Step() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  async function save(goal: string) {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/volt/v1/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal }),
      });
      if (!res.ok) throw new Error('Could not save. Try again.');
      router.push('/onboarding/activities');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'VOLT cannot reach the server.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <h1>Your goal</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[['build', 'Build'], ['maintain', 'Maintain'], ['recover', 'Recover']].map(([v, l]) => (
          <button key={v} className="volt-btn volt-btn-secondary" disabled={saving} onClick={() => save(v)}>{l}</button>
        ))}
      </div>
      <p style={{ marginTop: 12 }}><Link href="/onboarding/activities">Skip</Link> · <Link href="/onboarding/profile">Back</Link></p>
      {error ? <p role="alert" className="volt-error">{error}</p> : null}
    </>
  );
}
