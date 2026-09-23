'use client';
import { AppShell } from '@/components/nav';
import { useAccessHistory } from '@/lib/useVolt';
import { denialExplanation } from '@/lib/api/access';
export default function Page() {
  const { data } = useAccessHistory();
  const evts = ((data?.events ?? []) as { id: string; doorName: string; result: string; reason: string | null; createdAt: string }[]);
  return (<AppShell current="Gym Access"><h1>Access history</h1>{evts.length === 0 ? <div className="volt-card"><p>No access events yet.</p></div> : <table className="volt-table"><thead><tr><th>Door</th><th>Result</th><th>Detail</th><th>When</th></tr></thead><tbody>{evts.map((e) => (<tr key={e.id}><td>{e.doorName}</td><td>{e.result}</td><td>{e.result === 'GRANTED' ? 'Granted' : denialExplanation(e.reason)}</td><td className="volt-mono">{String(e.createdAt).slice(0, 16).replace('T', ' ')}</td></tr>))}</tbody></table>}</AppShell>);
}
