import Link from 'next/link';

export const NAV = [
  { href: '/app', label: 'Home' },
  { href: '/app/activities', label: 'Activity' },
  { href: '/app/discover', label: 'Discover' },
  { href: '/app/community', label: 'Community' },
  { href: '/app/gym', label: 'Gym Access' },
  { href: '/app/messages', label: 'Messages' },
  { href: '/app/profile', label: 'Profile' },
];

export function SiteHeader({ userName }: { userName?: string | null }) {
  return (
    <header role="banner" style={{ borderBottom: '1px solid var(--volt-line-soft)', background: 'var(--volt-bg)' }}>
      <div className="volt-wrap" style={{ display: 'flex', alignItems: 'center', gap: 16, minHeight: 60 }}>
        <Link href="/" aria-label="VOLT home" style={{ textDecoration: 'none', fontWeight: 800, letterSpacing: 2 }}>
          VOLT<span style={{ color: 'var(--volt-accent)' }}>_</span>
        </Link>
        <nav aria-label="Primary" style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
          <Link className="volt-btn volt-btn-secondary" href="/features">Features</Link>
          <Link className="volt-btn volt-btn-secondary" href="/gym-access">Gym access</Link>
          <Link className="volt-btn volt-btn-secondary" href="/for-gyms">For gyms</Link>
        </nav>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {userName ? (
            <>
              <span className="volt-mono" aria-label="Signed in user">{userName}</span>
              <Link className="volt-btn volt-btn-primary" href="/app">Open app</Link>
            </>
          ) : (
            <>
              <Link className="volt-btn volt-btn-secondary" href="/login">Log in</Link>
              <Link className="volt-btn volt-btn-primary" href="/signup">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer role="contentinfo" style={{ borderTop: '1px solid var(--volt-line-soft)', marginTop: 48 }}>
      <div className="volt-wrap" style={{ padding: '28px 22px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span className="volt-caps">VOLT · Move with intent</span>
        <nav aria-label="Footer" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginLeft: 'auto' }}>
          <Link href="/safety">Safety</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/for-gyms">For gyms</Link>
        </nav>
      </div>
    </footer>
  );
}

export function AppShell({ children, current, userName }: { children: React.ReactNode; current: string; userName?: string }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav aria-label="App" style={{ width: 220, borderRight: '1px solid var(--volt-line-soft)', padding: 16, display: 'none' }} className="volt-sidebar">
        <SidebarLinks current={current} />
      </nav>
      <style>{`@media(min-width:1200px){.volt-sidebar{display:block !important}}`}</style>
      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{ borderBottom: '1px solid var(--volt-line-soft)', padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/app" style={{ fontWeight: 800, letterSpacing: 2, textDecoration: 'none' }}>VOLT<span style={{ color: 'var(--volt-accent)' }}>_</span></Link>
          <span className="volt-caps" style={{ marginLeft: 8 }}>{current}</span>
          <div style={{ marginLeft: 'auto' }}>
            <Link href="/app/profile" aria-label="User menu" className="volt-mono">{userName ?? 'Account'}</Link>
          </div>
        </header>
        <main id="main" style={{ padding: '22px' }}><div style={{ maxWidth: 1080, margin: '0 auto' }}>{children}</div></main>
        <nav aria-label="Mobile" style={{ position: 'sticky', bottom: 0, background: 'var(--volt-bg-alt)', borderTop: '1px solid var(--volt-line-soft)', padding: '8px 4px' }}>
          <MobileLinks current={current} />
        </nav>
        <style>{`@media(min-width:768px){nav[aria-label="Mobile"]{display:none}}`}</style>
      </div>
    </div>
  );
}

function SidebarLinks({ current }: { current: string }) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 4 }}>
      {NAV.map((n) => (
        <li key={n.href}>
          <Link
            href={n.href}
            aria-current={current === n.label ? 'page' : undefined}
            style={{
              display: 'block', padding: '10px 12px', borderRadius: 4, textDecoration: 'none',
              borderLeft: current === n.label ? '3px solid var(--volt-accent)' : '3px solid transparent',
              background: current === n.label ? 'var(--volt-surface)' : 'transparent',
            }}
          >
            {n.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MobileLinks({ current }: { current: string }) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', overflowX: 'auto', gap: 4 }}>
      {NAV.map((n) => (
        <li key={n.href} style={{ flex: '1 0 auto' }}>
          <Link
            href={n.href}
            aria-current={current === n.label ? 'page' : undefined}
            style={{
              display: 'block', textAlign: 'center', padding: '12px 8px', minHeight: 44, textDecoration: 'none',
              color: current === n.label ? 'var(--volt-accent)' : 'var(--volt-text-mute)',
              fontSize: 13,
            }}
          >
            {n.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
