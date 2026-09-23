'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerSchema, type RegisterInput } from '@/lib/api/errors';
import { SiteHeader } from '@/components/nav';

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });
  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { message?: string }).message ?? 'Something went wrong. Try again.');
      router.push('/onboarding/profile');
      router.refresh();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'VOLT cannot reach the server.');
    }
  }
  return (
    <>
      <SiteHeader />
      <main id="main" className="volt-wrap" style={{ padding: '48px 22px', maxWidth: 520 }}>
        <p className="volt-caps">Join VOLT</p>
        <h1>Create account</h1>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: 'grid', gap: 14 }}>
            <div><label className="volt-label" htmlFor="name">Display name</label><input id="name" className="volt-input" autoComplete="name" {...register('name')} /><p className="volt-error">{formState.errors.name?.message}</p></div>
            <div><label className="volt-label" htmlFor="email">Email</label><input id="email" className="volt-input" type="email" autoComplete="email" {...register('email')} /><p className="volt-error">{formState.errors.email?.message}</p></div>
            <div><label className="volt-label" htmlFor="password">Password (min 8)</label><input id="password" className="volt-input" type="password" autoComplete="new-password" {...register('password')} /><p className="volt-error">{formState.errors.password?.message}</p></div>
            {serverError ? <p role="alert" className="volt-error">{serverError}</p> : null}
            <button className="volt-btn volt-btn-primary" disabled={formState.isSubmitting}>{formState.isSubmitting ? 'Creating…' : 'Create account'}</button>
          </div>
        </form>
        <p style={{ marginTop: 16 }}><Link href="/login">Already have an account? Log in</Link></p>
      </main>
    </>
  );
}
