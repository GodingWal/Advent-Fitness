'use client';
import { AppShell } from '@/components/nav';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Page() {
  const router = useRouter();
  const [f, setF] = useState({ title: '', activityType: 'Run', location: '', startsAt: '', capacity: 10 });
  const [error, setError] = useState<string | null>(null);
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    try {
      const res = await fetch('/api/volt/v1/meetups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, startsAt: new Date(f.startsAt).toISOString(), capacity: Number(f.capacity) }) });
      if (!res.ok) throw new Error('Could not create meetup.');
      router.push('/app/meetups');
    } catch (e) { setError(e instanceof Error ? e.message : 'VOLT cannot reach the server.'); }
  }
  return (<AppShell current="Community"><h1>New meetup</h1><form onSubmit={submit} className="volt-card" style={{ display: 'grid', gap: 12, maxWidth: 560 }}><div><label className="volt-label" htmlFor="t">Title</label><input id="t" className="volt-input" value={f.title} onChange={(e) => set('title', e.target.value)} required /></div><div><label className="volt-label" htmlFor="a">Activity</label><input id="a" className="volt-input" value={f.activityType} onChange={(e) => set('activityType', e.target.value)} /></div><div><label className="volt-label" htmlFor="l">Location</label><input id="l" className="volt-input" value={f.location} onChange={(e) => set('location', e.target.value)} required /></div><div><label className="volt-label" htmlFor="s">Starts at</label><input id="s" className="volt-input" type="datetime-local" value={f.startsAt} onChange={(e) => set('startsAt', e.target.value)} required /></div>{error ? <p role="alert" className="volt-error">{error}</p> : null}<button className="volt-btn volt-btn-primary">Create</button></form></AppShell>);
}
