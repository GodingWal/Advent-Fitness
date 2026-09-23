'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMemberships } from '@/lib/useVolt';
export default function Step() {
  const router = useRouter();
  const { data } = useMemberships();
  const [error, setError] = useState<string | null>(null);
  async function save(patch: Record<string, unknown>) {
    try {
      const res = await fetch('/api/volt/v1/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
      if (!res.ok) throw new Error('Could not save.');
      router.push('/onboarding/complete');
    } catch (e) { setError(e instanceof Error ? e.message : 'VOLT cannot reach the server.'); }
  }
  const gyms = (data?.memberships ?? []) as { gym: { id: string; name: string } }[];
  return (<><h1>Home gym</h1><div style={{ display: 'grid', gap: 8 }}>{gyms.map((m) => (<button key={m.gym.id} className="volt-btn volt-btn-secondary" onClick={() => save({ homeGymId: m.gym.id })}>{m.gym.name}</button>))}</div><div style={{ height: 12 }} /><button className="volt-btn volt-btn-secondary" onClick={() => save({})}>Skip</button><p><Link href="/onboarding/activities">Back</Link></p>{error ? <p role="alert" className="volt-error">{error}</p> : null}</>);
}
