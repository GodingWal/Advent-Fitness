'use client';
import { AppShell } from '@/components/nav';
import { useState } from 'react';
import { useProfile } from '@/lib/useVolt';
export default function Page() {
  const { data, refetch } = useProfile();
  const p = (data?.profile ?? {}) as { weeklyTargetH?: number; units?: string; goal?: string };
  const [f, setF] = useState({ weeklyTargetH: 3, units: 'mi', goal: '' });
  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/volt/v1/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weeklyTargetH: Number(f.weeklyTargetH), units: f.units, goal: f.goal }) });
    refetch();
  }
  return (<AppShell current="Profile"><h1>Edit profile</h1><form onSubmit={save} className="volt-card" style={{ display: 'grid', gap: 12, maxWidth: 520 }}><div><label className="volt-label" htmlFor="h">Weekly target (h)</label><input id="h" className="volt-input" type="number" defaultValue={p.weeklyTargetH ?? 3} onChange={(e) => setF((s) => ({ ...s, weeklyTargetH: Number(e.target.value) }))} /></div><div><label className="volt-label" htmlFor="u">Units</label><select id="u" className="volt-select" defaultValue={p.units ?? 'mi'} onChange={(e) => setF((s) => ({ ...s, units: e.target.value }))}><option value="mi">mi</option><option value="km">km</option></select></div><div><label className="volt-label" htmlFor="g">Goal</label><input id="g" className="volt-input" defaultValue={p.goal ?? ''} onChange={(e) => setF((s) => ({ ...s, goal: e.target.value }))} /></div><button className="volt-btn volt-btn-primary">Save</button></form></AppShell>);
}
