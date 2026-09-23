'use client';
import { AppShell } from '@/components/nav';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { formatDistance, formatPace, formatDurationMin } from '@/lib/format';
export default function Page() {
  const { activityId } = useParams<{ activityId: string }>();
  const router = useRouter();
  const { data, isLoading, error } = useQuery({ queryKey: ['activity', activityId], queryFn: async () => { const r = await fetch('/api/volt/v1/activities/' + activityId); if (!r.ok) throw new Error('Not found'); return r.json(); } });
  const a = data?.activity as { title: string; type: string; durationMin: number; distanceKm?: number; calories?: number; elevationM?: number; avgPaceSecPerKm?: number; notes?: string } | undefined;
  async function remove() {
    if (!confirm('Delete this activity?')) return;
    await fetch('/api/volt/v1/activities/' + activityId, { method: 'DELETE' });
    router.push('/app/activities');
  }
  return (<AppShell current="Activity">{isLoading ? <p>Loading…</p> : error || !a ? <p role="alert" className="volt-error">Activity not found.</p> : (<><h1>{a.title}</h1><div className="volt-card"><p className="volt-mono">{a.type} · {formatDurationMin(a.durationMin)} · {formatDistance(a.distanceKm, 'mi')} · {formatPace(a.avgPaceSecPerKm, 'mi')}</p><p>Calories: {a.calories ?? '—'} · Elevation: {a.elevationM ?? '—'} m</p>{a.notes ? <p>{a.notes}</p> : null}<button className="volt-btn volt-btn-secondary" onClick={remove}>Delete</button></div></>)}</AppShell>);
}
