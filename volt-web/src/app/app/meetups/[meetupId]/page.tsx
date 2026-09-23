'use client';
import { AppShell } from '@/components/nav';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
export default function Page() {
  const { meetupId } = useParams<{ meetupId: string }>();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['meetup', meetupId], queryFn: async () => (await (await fetch('/api/volt/v1/meetups/' + meetupId)).json()) as { meetup: { title: string; description: string; attendeeCount: number; organizerName: string; location: string } } });
  const m = data?.meetup;
  async function join() { await fetch('/api/volt/v1/meetups/' + meetupId + '/join', { method: 'POST' }); qc.invalidateQueries({ queryKey: ['meetup', meetupId] }); }
  return (<AppShell current="Community"><h1>{m?.title ?? 'Meetup'}</h1><div className="volt-card">{m ? (<><p>{m.description}</p><p className="volt-mono">{m.location} · {m.attendeeCount} going · by {m.organizerName}</p><button className="volt-btn volt-btn-primary" onClick={join}>Join</button></>) : <p>Loading…</p>}</div></AppShell>);
}
