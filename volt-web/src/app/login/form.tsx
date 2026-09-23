'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginSchema, type LoginInput } from '@/lib/api/errors';
import { friendlySubmitError } from '@/lib/auth/messages';
import { SiteHeader } from '@/components/nav';

export default function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get('next') ?? '/app';
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  async function onSubmit(values: LoginInput) {
    setServerError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { message?: string }).message ?? 'Incorrect email or password.');
      router.push(next);
      router.refresh();
    } catch (e) {
      setServerError(friendlySubmitError(e));
    }
  }
  return (
    <>
      <SiteHeader />
      <main id="main" className="volt-wrap" style={{ padding: '48px 22px', maxWidth: 520 }}>
        <p className="volt-caps">Welcome back</p>
        <h1>Log in</h1>
        <form onSubmit={handleSubmit(onSubmit)} noValidate aria-describedby={serverError ? 'login-error' : undefined}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div><label className="volt-label" htmlFor="email">Email</label><input id="email" className="volt-input" type="email" autoComplete="email" {...register('email')} aria-invalid={Boolean(formState.errors.email)} /><p className="volt-error">{formState.errors.email?.message}</p></div>
            <div><label className="volt-label" htmlFor="password">Password</label><input id="password" className="volt-input" type="password" autoComplete="current-password" {...register('password')} aria-invalid={Boolean(formState.errors.password)} /><p className="volt-error">{formState.errors.password?.message}</p></div>
            {serverError ? <p id="login-error" role="alert" className="volt-error">{serverError}</p> : null}
            <button className="volt-btn volt-btn-primary" disabled={formState.isSubmitting}>{formState.isSubmitting ? 'Logging in…' : 'Log in'}</button>
          </div>
        </form>
        <p style={{ marginTop: 16 }}><Link href="/forgot-password">Forgot password?</Link> · <Link href="/signup">Create account</Link></p>
      </main>
    </>
  );
}
