'use client';
import { AppShell } from '@/components/nav';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
export default function Page() {
  const { locationId } = useParams<{ locationId: string }>();
  const [qr, setQr] = useState<{ token: string; expiresAt: string } | null>(null);
  const { data } = useQuery({ queryKey: ['doors', locationId], queryFn: async () => (await (await fetch('/api/volt/v1/locations/' + locationId + '/doors')).json()) as { doors: { id: string; name: string; status: string; accessHours: unknown }[] } });
  async function showQr(membershipId: string) {
    const res = await fetch('/api/volt/v1/access/qr-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ membershipId }) });
    if (res.ok) setQr(await res.json());
  }
  return (<AppShell current="Gym Access"><h1>Location</h1><div className="volt-card">{(data?.doors ?? []).map((d) => (<p key={d.id}><strong>{d.name}</strong> · <span className="volt-mono">{d.status}</span></p>))}<p style={{ color: 'var(--volt-text-mute)' }}>Browser door unlocking is disabled. Show a short-lived QR at the entrance instead.</p>{qr ? <p className="volt-mono" role="status">QR expires {qr.expiresAt}: {qr.token.slice(0, 24)}…</p> : <button className="volt-btn volt-btn-primary" onClick={async () => { const m = await (await fetch('/api/volt/v1/memberships')).json(); if (m?.memberships?.[0]) showQr(m.memberships[0].id); }}>Show gym pass</button>}</div></AppShell>);
}
