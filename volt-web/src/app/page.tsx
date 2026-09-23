import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/nav';

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="volt-wrap" style={{ padding: '72px 22px 40px' }} aria-labelledby="hero">
          <p className="volt-caps">VOLT · Unified training + gym access</p>
          <h1 id="hero" style={{ fontSize: 56, lineHeight: 1, letterSpacing: -2, margin: '12px 0' }}>
            Move with intent.
          </h1>
          <p style={{ maxWidth: 640, color: 'var(--volt-text-mute)', fontSize: 18 }}>
            Track workouts, follow a weekly target, and open your gym with the same
            account on mobile and web. One membership, one profile, one activity history.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            <Link className="volt-btn volt-btn-primary" href="/signup">Create account</Link>
            <Link className="volt-btn volt-btn-secondary" href="/login">Log in</Link>
          </div>
          <div className="volt-grid-3" style={{ marginTop: 32 }} role="list" aria-label="Performance highlights">
            <div className="volt-card" role="listitem"><p className="volt-caps">Weekly target</p><p className="volt-mono" style={{ fontSize: 28 }}>3h / week</p><p style={{ color: 'var(--volt-text-mute)' }}>Default training goal, adjustable anytime.</p></div>
            <div className="volt-card" role="listitem"><p className="volt-caps">Access model</p><p className="volt-mono" style={{ fontSize: 28 }}>QR · 60s</p><p style={{ color: 'var(--volt-text-mute)' }}>Short-lived passes. No lock secrets in the browser.</p></div>
            <div className="volt-card" role="listitem"><p className="volt-caps">Platforms</p><p className="volt-mono" style={{ fontSize: 28 }}>Web + mobile</p><p style={{ color: 'var(--volt-text-mute)' }}>Same account and data everywhere.</p></div>
          </div>
        </section>

        <section className="volt-wrap" aria-labelledby="track" style={{ padding: '24px 22px' }}>
          <h2 id="track">Activity tracking</h2>
          <div className="volt-grid-2">
            <div className="volt-card"><h3>History and analysis</h3><p style={{ color: 'var(--volt-text-mute)' }}>Filter by date, type and duration. Open any workout for pace, distance, time, calories and elevation. Add manual entries when you forget your tracker.</p><Link href="/features">Explore features</Link></div>
            <div className="volt-card"><h3>Weekly progress</h3><p style={{ color: 'var(--volt-text-mute)' }}>Set a weekly hour target and watch progress, streaks and recent workouts from the dashboard.</p><Link href="/signup">Set your target</Link></div>
          </div>
        </section>

        <section className="volt-wrap" aria-labelledby="gym" style={{ padding: '24px 22px' }}>
          <h2 id="gym">Gym access</h2>
          <div className="volt-card">
            <p style={{ color: 'var(--volt-text-mute)' }}>View memberships, covered locations, door availability and access history. Display a short-lived QR at the entrance. Physical unlocking stays on the registered mobile app unless your gym enables a separately approved model.</p>
            <Link className="volt-btn volt-btn-secondary" href="/gym-access">How gym access works</Link>
          </div>
        </section>

        <section className="volt-wrap" aria-labelledby="community" style={{ padding: '24px 22px' }}>
          <h2 id="community">Community and meetups</h2>
          <div className="volt-grid-2">
            <div className="volt-card"><h3>Train together</h3><p style={{ color: 'var(--volt-text-mute)' }}>Browse meetups by activity, location and date. Join, leave, and get directions with safety controls.</p></div>
            <div className="volt-card"><h3>Discover places</h3><p style={{ color: 'var(--volt-text-mute)' }}>Search nearby spots and gyms through the backend Places proxy — your keys never ship to the browser.</p></div>
          </div>
        </section>

        <section className="volt-wrap" aria-labelledby="app" style={{ padding: '24px 22px' }}>
          <h2 id="app">Mobile application</h2>
          <div className="volt-card"><p style={{ color: 'var(--volt-text-mute)' }}>Live GPS tracking and door unlocking remain mobile-first. The web focuses on history, analysis, planning and membership management — same account, same backend.</p></div>
        </section>

        <section className="volt-wrap" aria-labelledby="partners" style={{ padding: '24px 22px' }}>
          <h2 id="partners">For gym partners</h2>
          <div className="volt-card"><p style={{ color: 'var(--volt-text-mute)' }}>Offer members one account for training and access. No operator dashboard in this release — member management stays with your existing tools.</p><Link className="volt-btn volt-btn-secondary" href="/for-gyms">Talk to us</Link></div>
        </section>

        <section className="volt-wrap" aria-labelledby="safety" style={{ padding: '24px 22px 48px' }}>
          <h2 id="safety">Safety and privacy</h2>
          <p style={{ color: 'var(--volt-text-mute)' }}>Privacy controls, short-lived credentials, and audit trails are built in. Read the <Link href="/safety">safety summary</Link>, <Link href="/privacy">privacy policy</Link> and <Link href="/terms">terms</Link>.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
