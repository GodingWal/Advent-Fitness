'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ALL = ['Run', 'Ride', 'Swim', 'Lift', 'Walk', 'Yoga'];

export default function Step() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  function toggle(a: string) {
    setSel((s) => (s.includes(a) ? s.filter((x) => x !== a) : [...s, a]));
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/volt/v1/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: sel }),
      });
      if (!res.ok) throw new Error('Could not save. Try again.');
      router.push('/onboarding/gym');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'VOLT cannot reach the server.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <h1>Preferred activities</h1>
      <form onSubmit={save}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="group" aria-label="Activities">
          {ALL.map((a) => (
            <button key={a} type="button" aria-pressed={sel.includes(a)} className="volt-btn volt-btn-secondary" onClick={() => toggle(a)}>{a}</button>
          ))}
        </div>
        <div style={{ height: 16 }} />
        <button className="volt-btn volt-btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Continue'}</button>{' '}
        <Link href="/onboarding/gym">Skip</Link>
      </form>
      {error ? <p role="alert" className="volt-error">{error}</p> : null}
    </>
  );
}
