import { AppShell } from '@/components/nav';
export default function Page() { return (<AppShell current="Discover"><h1>Spot</h1><div className="volt-card"><p style={{ color: 'var(--volt-text-mute)' }}>Spot details load from the Discover list. Ratings, saved spots and meetup indicators appear here when the backend provides them.</p></div></AppShell>); }
