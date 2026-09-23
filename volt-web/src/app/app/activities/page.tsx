'use client';
import { AppShell } from '@/components/nav';
import Link from 'next/link';
import { useState } from 'react';
import { useActivities } from '@/lib/useVolt';
export default function Page() {
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const q = (type ? '&type=' + encodeURIComponent(type) : '') + (search ? '&search=' + encodeURIComponent(search) : '');
  const { data, isLoading, error } = useActivities(q ? '?' + q.slice(1) : '');
  const acts = ((data?.activities ?? []) as { id: string; title: string; type: string; startedAt: string; durationMin: number }[]);
  return (<AppShell current="Activity"><h1>Activities</h1><div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}><input className="volt-input" style={{ maxWidth: 240 }} placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search activities" /><select className="volt-select" style={{ maxWidth: 180 }} value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type"><option value="">All types</option><option>Run</option><option>Ride</option><option>Swim</option><option>Lift</option></select><Link className="volt-btn volt-btn-primary" href="/app/activities/new">Log activity</Link></div>{isLoading ? <p>Loading…</p> : error ? <p role="alert" className="volt-error">VOLT cannot reach the server.</p> : acts.length === 0 ? <div className="volt-card"><p>No activities yet.</p></div> : <div style={{ display: 'grid', gap: 8 }}>{acts.map((a) => (<Link key={a.id} href={'/app/activities/' + a.id} className="volt-card" style={{ textDecoration: 'none' }}><strong>{a.title}</strong><br /><span className="volt-mono">{a.type} · {a.durationMin} min · {String(a.startedAt).slice(0, 10)}</span></Link>))}</div>}</AppShell>);
}
