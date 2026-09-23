'use client';
import { AppShell } from '@/components/nav';
import Link from 'next/link';
import { useProfile } from '@/lib/useVolt';
export default function Page() {
  const { data } = useProfile();
  const p = (data?.profile ?? {}) as Record<string, unknown>;
  return (<AppShell current="Profile"><h1>Profile</h1><div className="volt-card"><p className="volt-mono">Target {String(p.weeklyTargetH ?? 3)}h · Goal {String(p.goal || '—')} · Units {String(p.units ?? 'mi')}</p><p>Activities: {((p.activities as string[]) ?? []).join(', ') || '—'}</p><div style={{ display: 'flex', gap: 8 }}><Link className="volt-btn volt-btn-secondary" href="/app/profile/edit">Edit</Link><Link className="volt-btn volt-btn-secondary" href="/app/profile/achievements">Achievements</Link><Link className="volt-btn volt-btn-secondary" href="/app/settings">Settings</Link></div></div></AppShell>);
}
