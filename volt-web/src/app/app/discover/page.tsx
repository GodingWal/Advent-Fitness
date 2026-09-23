'use client';
import { AppShell } from '@/components/nav';
import { useState } from 'react';
import { nearbyPlaces, type Place } from '@/lib/api/places';
export default function Page() {
  const [items, setItems] = useState<Place[]>([]);
  const [category, setCategory] = useState('gym');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function search() {
    setLoading(true); setError(null);
    try { setItems(await nearbyPlaces({ category, latitude: 43.648, longitude: -93.368, radius: 5000 })); }
    catch { setError('VOLT cannot reach the server.'); }
    finally { setLoading(false); }
  }
  return (<AppShell current="Discover"><h1>Discover</h1><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}><select className="volt-select" style={{ maxWidth: 200 }} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category"><option value="gym">Gyms</option><option value="park">Parks</option><option value="pool">Pools</option><option value="track">Tracks</option></select><button className="volt-btn volt-btn-primary" onClick={search}>Search nearby</button></div>{loading ? <p>Loading…</p> : error ? <p role="alert" className="volt-error">{error}</p> : items.length === 0 ? <div className="volt-card"><p style={{ color: 'var(--volt-text-mute)' }}>Search nearby spots. Results also appear as an accessible list (map is a progressive enhancement).</p></div> : <ul style={{ display: 'grid', gap: 8, padding: 0, listStyle: 'none' }}>{items.map((p) => (<li key={p.id} className="volt-card"><strong>{p.name}</strong><br /><span style={{ color: 'var(--volt-text-mute)' }}>{p.address}</span></li>))}</ul>}</AppShell>);
}
