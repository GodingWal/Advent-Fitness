'use client';
import { AppShell } from '@/components/nav';
import { useMemberships } from '@/lib/useVolt';
export default function Page() {
  const { data } = useMemberships();
  const items = ((data?.memberships ?? []) as { id: string; status: string; gym: { name: string } }[]);
  return (<AppShell current="Gym Access"><h1>Memberships</h1>{items.map((m) => (<div key={m.id} className="volt-card" style={{ marginBottom: 8 }}><strong>{m.gym.name}</strong> · {m.status}</div>))}</AppShell>);
}
