// Maps backend failures to actionable user-facing copy. No raw stack traces.
export function authErrorMessage(status: number, code?: string): string {
  if (status === 401) return 'Incorrect email or password.';
  if (status === 409 || code === 'EMAIL_TAKEN') return 'This email is already registered. Try logging in or reset your password.';
  if (status === 404 || status === 410) return 'Your email verification link expired. Request a new one.';
  if (status === 0) return 'VOLT cannot reach the server. Check your connection and try again.';
  if (status === 429) return 'Too many attempts. Wait a moment and try again.';
  if (status >= 500) return 'VOLT cannot reach the server. Try again in a moment.';
  return 'Something went wrong. Try again.';
}

export function sessionExpiredMessage(): string {
  return 'Your session expired. Log in again.';
}

// Maps caught submit errors (including raw browser network failures like
// "Failed to fetch") to actionable copy. Never surfaces raw internals.
export function friendlySubmitError(e: unknown): string {
  if (e instanceof Error) {
    if (/failed to fetch|networkerror|load failed|abort/i.test(e.message)) {
      return 'VOLT cannot reach the server. Check your connection and try again.';
    }
    return e.message;
  }
  return 'VOLT cannot reach the server. Check your connection and try again.';
}
