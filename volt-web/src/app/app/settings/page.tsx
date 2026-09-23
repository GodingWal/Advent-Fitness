'use client';
import { AppShell } from '@/components/nav';
import { useRouter } from 'next/navigation';
export default function Page() {
  const router = useRouter();
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login'); router.refresh(); }
  return (<AppShell current="Profile"><h1>Settings</h1><div className="volt-card" style={{ display: 'grid', gap: 12 }}><p style={{ color: 'var(--volt-text-mute)' }}>Sessions, notifications, privacy and data export live here. Account deletion revokes all sessions server-side.</p><button className="volt-btn volt-btn-secondary" onClick={logout}>Log out</button></div></AppShell>);
}
