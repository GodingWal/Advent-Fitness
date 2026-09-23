import { SiteHeader, SiteFooter } from '@/components/nav';

export const metadata = { title: 'Safety' };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="volt-wrap" style={{ padding: '40px 22px' }}>
        <p className="volt-caps">VOLT</p>
        <h1>Safety</h1>
        <div className="volt-card"><ul><li>Meet in public places and verify meetup organizers.</li><li>Report abusive content or unsafe meetups from the meetup page.</li><li>QR passes expire in 60 seconds and are single-use.</li><li>Browser unlocking is disabled; use the registered mobile app at doors.</li></ul></div>
      </main>
      <SiteFooter />
    </>
  );
}
