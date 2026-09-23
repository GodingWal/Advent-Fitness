import { Suspense } from 'react';
import LoginForm from './form';

export const metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <Suspense fallback={<main id="main" className="volt-wrap" style={{ padding: 48 }}><p>Loading…</p></main>}>
      <LoginForm />
    </Suspense>
  );
}
