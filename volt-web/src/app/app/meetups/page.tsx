'use client';
import { AppShell } from '@/components/nav';
import Link from 'next/link';
import { useMeetups } from '@/lib/useVolt';
export default function Page() {
  const { data, isLoading, error } = useMeetups();
  const items = ((data?.meetups ?? []) as { id: string; title: string; activityType: string; location: string; attendeeCount: number }[]);
  return (<AppShell current="Community"><h1>Meetups</h1><Link className="volt-btn volt-btn-primary" href="/app/meetups/new">Create meetup</Link><div style={{ height: 12 }} />{isLoading ? <p>Loading…</p> : error ? <p role="alert" className="volt-error">VOLT cannot reach the server.</p> : items.length === 0 ? <div className="volt-card"><p>No meetups yet.</p></div> : <div style={{ display: 'grid', gap: 8 }}>{items.map((m) => (<Link key={m.id} href={'/app/meetups/' + m.id} className="volt-card" style={{ textDecoration: 'none' }}><strong>{m.title}</strong><br /><span className="volt-mono">{m.activityType} · {m.location} · {m.attendeeCount} going</span></Link>))}</div>}</AppShell>);
}
