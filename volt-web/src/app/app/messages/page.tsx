'use client';
import { AppShell } from '@/components/nav';
import Link from 'next/link';
import { useConversations } from '@/lib/useVolt';
export default function Page() {
  const { data, isLoading, error } = useConversations();
  const items = ((data?.conversations ?? []) as { id: string; peerName: string; lastMessage: string; unread: number }[]);
  return (<AppShell current="Messages"><h1>Messages</h1>{isLoading ? <p>Loading…</p> : error ? <p role="alert" className="volt-error">VOLT cannot reach the server.</p> : items.length === 0 ? <div className="volt-card"><p>No conversations yet.</p></div> : <div style={{ display: 'grid', gap: 8 }}>{items.map((c) => (<Link key={c.id} href={'/app/messages/' + c.id} className="volt-card" style={{ textDecoration: 'none' }}><strong>{c.peerName}</strong>{c.unread > 0 ? <span className="volt-mono"> · {c.unread} unread</span> : null}<br /><span style={{ color: 'var(--volt-text-mute)' }}>{c.lastMessage}</span></Link>))}</div>}</AppShell>);
}
