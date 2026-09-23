'use client';
import { AppShell } from '@/components/nav';
import Link from 'next/link';
import { useMemberships } from '@/lib/useVolt';
import { membershipStatusLabel } from '@/lib/api/access';
export default function Page() {
  const { data, isLoading, error } = useMemberships();
  const items = ((data?.memberships ?? []) as { id: string; status: string; expiresAt: string; gym: { id: string; name: string } }[]);
  return (<AppShell current="Gym Access"><h1>Gym access</h1><div style={{ display: 'flex', gap: 8, marginBottom: 12 }}><Link className="volt-btn volt-btn-secondary" href="/app/gym/memberships">Memberships</Link><Link className="volt-btn volt-btn-secondary" href="/app/gym/access-history">Access history</Link></div>{isLoading ? <p>Loading…</p> : error ? <p role="alert" className="volt-error">VOLT cannot reach the server.</p> : items.length === 0 ? <div className="volt-card"><p>No memberships.</p></div> : <div className="volt-grid-2">{items.map((m) => (<div key={m.id} className="volt-card"><p className="volt-caps">{membershipStatusLabel(m.status)}</p><h3>{m.gym.name}</h3><p className="volt-mono">Expires {String(m.expiresAt).slice(0, 10)}</p><Link href={'/app/gym/locations/' + m.gym.id}>View locations</Link></div>))}</div>}</AppShell>);
}
