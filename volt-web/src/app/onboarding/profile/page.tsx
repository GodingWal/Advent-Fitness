'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Step() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [weeklyTargetH, setH] = useState(3);
  const [units, setUnits] = useState('mi');
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/volt/v1/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyTargetH, units }),
      });
      if (!res.ok) throw new Error('Could not save. Try again.');
      router.push('/onboarding/goal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'VOLT cannot reach the server.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <h1>Your profile</h1>
      <form onSubmit={save}>
        <label className="volt-label" htmlFor="h">Weekly training target (hours)</label>
        <input id="h" className="volt-input" type="number" min={1} max={30} value={weeklyTargetH} onChange={(e) => setH(Number(e.target.value))} />
        <div style={{ height: 12 }} />
        <label className="volt-label" htmlFor="u">Units</label>
        <select id="u" className="volt-select" value={units} onChange={(e) => setUnits(e.target.value)}>
          <option value="mi">Miles</option>
          <option value="km">Kilometers</option>
        </select>
        <div style={{ height: 16 }} />
        <button className="volt-btn volt-btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Continue'}</button>
      </form>
      {error ? <p role="alert" className="volt-error">{error}</p> : null}
    </>
  );
}
