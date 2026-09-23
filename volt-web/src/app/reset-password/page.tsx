import { Suspense } from 'react';
import ResetForm from './form';

export const metadata = { title: 'Reset password' };

export default function ResetPage() {
  return (
    <Suspense fallback={<main id="main" className="volt-wrap" style={{ padding: 48 }}><p>Loading…</p></main>}>
      <ResetForm />
    </Suspense>
  );
}
