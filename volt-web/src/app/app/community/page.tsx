'use client';
import { AppShell } from '@/components/nav';
import { useState } from 'react';
import { usePosts } from '@/lib/useVolt';
export default function Page() {
  const { data, isLoading, error, refetch } = usePosts();
  const [body, setBody] = useState('');
  const posts = ((data?.posts ?? []) as { id: string; authorName: string; body: string; likeCount: number }[]);
  async function post() {
    if (!body.trim()) return;
    await fetch('/api/volt/v1/feed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }) });
    setBody(''); refetch();
  }
  async function like(id: string) {
    await fetch('/api/volt/v1/feed/' + id + '/reactions', { method: 'POST' });
    refetch();
  }
  return (<AppShell current="Community"><h1>Community</h1><div className="volt-card" style={{ marginBottom: 12 }}><label className="volt-label" htmlFor="post">Share an update</label><textarea id="post" className="volt-textarea" value={body} onChange={(e) => setBody(e.target.value)} rows={3} /><div style={{ height: 8 }} /><button className="volt-btn volt-btn-primary" onClick={post}>Post</button></div>{isLoading ? <p>Loading…</p> : error ? <p role="alert" className="volt-error">VOLT cannot reach the server.</p> : posts.length === 0 ? <div className="volt-card"><p>No posts yet. Be the first.</p></div> : <div style={{ display: 'grid', gap: 8 }}>{posts.map((p) => (<div key={p.id} className="volt-card"><strong>{p.authorName}</strong><p>{p.body}</p><button className="volt-btn volt-btn-secondary" onClick={() => like(p.id)}>Like · {p.likeCount}</button></div>))}</div>}</AppShell>);
}
