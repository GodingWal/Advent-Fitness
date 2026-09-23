'use client';
import { AppShell } from '@/components/nav';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Page() {
  const router = useRouter();
  const [form, setForm] = useState({ type: 'Run', title: '', startedAt: new Date().toISOString().slice(0, 16), durationMin: 30, distanceKm: '', notes: '' });
  const [error, setError] = useState<string | null>(null);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    if (!form.title) { setError('Enter a title.'); return; }
    try {
      const res = await fetch('/api/volt/v1/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: form.type, title: form.title, startedAt: new Date(form.startedAt).toISOString(), durationMin: Number(form.durationMin), distanceKm: form.distanceKm ? Number(form.distanceKm) : null, notes: form.notes || null }) });
      if (!res.ok) throw new Error('Could not save activity.');
      router.push('/app/activities');
    } catch (e) { setError(e instanceof Error ? e.message : 'VOLT cannot reach the server.'); }
  }
  return (<AppShell current="Activity"><h1>Log activity</h1><form onSubmit={submit} className="volt-card" style={{ display: 'grid', gap: 12, maxWidth: 560 }}><div><label className="volt-label" htmlFor="t">Type</label><select id="t" className="volt-select" value={form.type} onChange={(e) => set('type', e.target.value)}><option>Run</option><option>Ride</option><option>Swim</option><option>Lift</option><option>Walk</option><option>Yoga</option></select></div><div><label className="volt-label" htmlFor="ti">Title</label><input id="ti" className="volt-input" value={form.title} onChange={(e) => set('title', e.target.value)} required /></div><div><label className="volt-label" htmlFor="s">Start</label><input id="s" className="volt-input" type="datetime-local" value={form.startedAt} onChange={(e) => set('startedAt', e.target.value)} /></div><div><label className="volt-label" htmlFor="d">Duration (min)</label><input id="d" className="volt-input" type="number" min={1} value={form.durationMin} onChange={(e) => set('durationMin', e.target.value)} /></div><div><label className="volt-label" htmlFor="km">Distance (km, optional)</label><input id="km" className="volt-input" type="number" min={0} step="0.1" value={form.distanceKm} onChange={(e) => set('distanceKm', e.target.value)} /></div>{error ? <p role="alert" className="volt-error">{error}</p> : null}<button className="volt-btn volt-btn-primary">Save activity</button></form></AppShell>);
}
