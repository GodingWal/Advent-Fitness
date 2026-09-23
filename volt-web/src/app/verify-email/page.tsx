import { Suspense } from 'react';
import VerifyForm from './form';

export const metadata = { title: 'Verify email' };

export default function VerifyPage() {
  return (
    <Suspense fallback={<main id="main" className="volt-wrap" style={{ padding: 48 }}><p>Loading…</p></main>}>
      <VerifyForm />
    </Suspense>
  );
}
