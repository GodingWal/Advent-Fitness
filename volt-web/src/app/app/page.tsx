'use client';
import { AppShell } from '@/components/nav';
import Link from 'next/link';
import { useProfile, useMemberships, useActivities, useMeetups, usePosts } from '@/lib/useVolt';
import { weekProgress, formatDurationMin } from '@/lib/format';

export default function Page() {
  const { data: p, isLoading: pl, error: pe } = useProfile();
  const { data: m } = useMemberships();
  const { data: a } = useActivities();
  const { data: mt } = useMeetups();
  const { data: posts } = usePosts();
  const profile = (p?.profile ?? {}) as { weeklyTargetH?: number; onboardingCompleted?: boolean };
  const acts = ((a?.activities ?? []) as { durationMin: number; title: string }[]);
  const doneMin = acts.slice(0, 20).reduce((s, x) => s + (x.durationMin ?? 0), 0);
  const pct = weekProgress(doneMin, profile.weeklyTargetH ?? 3);
  const memberships = ((m?.memberships ?? []) as { status: string; gym: { name: string } }[]);
  const meetups = ((mt?.meetups ?? []) as { title: string }[]);
  const feed = ((posts?.posts ?? []) as { body: string }[]);
  return (
    <AppShell current="Home">
      <h1>Dashboard</h1>
      {pe ? <p role="alert" className="volt-error">VOLT cannot reach the server. Check your connection and try again.</p> : null}
      {pl ? <p>Loading…</p> : (
        <div className="volt-grid-2">
          <div className="volt-card"><p className="volt-caps">Weekly progress</p><p className="volt-mono" style={{ fontSize: 28 }}>{formatDurationMin(doneMin)} · {pct}%</p><p style={{ color: 'var(--volt-text-mute)' }}>Target {(profile.weeklyTargetH ?? 3)}h / week</p></div>
          <div className="volt-card"><p className="volt-caps">Membership</p><p>{memberships[0] ? memberships[0].gym.name + ' · ' + memberships[0].status : 'No membership yet'}</p><Link href="/app/gym">View gym access</Link></div>
          <div className="volt-card"><p className="volt-caps">Recent workouts</p>{acts.length === 0 ? <p style={{ color: 'var(--volt-text-mute)' }}>No workouts yet. Log your first one.</p> : <ul>{acts.slice(0, 3).map((x, i) => <li key={i}>{x.title} · {formatDurationMin(x.durationMin)}</li>)}</ul>}<Link href="/app/activities">All activities</Link></div>
          <div className="volt-card"><p className="volt-caps">Upcoming meetup</p><p>{meetups[0]?.title ?? 'Nothing scheduled'}</p><Link href="/app/meetups">Browse meetups</Link></div>
          <div className="volt-card"><p className="volt-caps">Community</p><p>{feed[0]?.body?.slice(0, 80) ?? 'No posts yet'}</p><Link href="/app/community">Open feed</Link></div>
          <div className="volt-card"><p className="volt-caps">Quick actions</p><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Link className="volt-btn volt-btn-primary" href="/app/activities/new">Start activity</Link><Link className="volt-btn volt-btn-secondary" href="/app/gym">Open gym pass</Link><Link className="volt-btn volt-btn-secondary" href="/app/discover">Find a location</Link><Link className="volt-btn volt-btn-secondary" href="/app/meetups/new">Create meetup</Link></div></div>
        </div>
      )}
    </AppShell>
  );
}
