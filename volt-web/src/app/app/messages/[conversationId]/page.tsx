'use client';
import { AppShell } from '@/components/nav';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
export default function Page() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const { data } = useQuery({ queryKey: ['msgs', conversationId], queryFn: async () => (await (await fetch('/api/volt/v1/conversations/' + conversationId + '/messages')).json()) as { messages: { id: string; sender: string; body: string }[] }, refetchInterval: 8000 });
  async function send() {
    if (!text.trim()) return;
    await fetch('/api/volt/v1/conversations/' + conversationId + '/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: text }) });
    setText(''); qc.invalidateQueries({ queryKey: ['msgs', conversationId] });
  }
  return (<AppShell current="Messages"><h1>Conversation</h1><div className="volt-card" style={{ display: 'grid', gap: 8 }}>{(data?.messages ?? []).map((m) => (<p key={m.id}><strong>{m.sender}:</strong> {m.body}</p>))}<div style={{ display: 'flex', gap: 8 }}><input className="volt-input" value={text} onChange={(e) => setText(e.target.value)} aria-label="Message" /><button className="volt-btn volt-btn-primary" onClick={send}>Send</button></div></div></AppShell>);
}
