import { z } from 'zod';
import { apiFetch } from './client';

export async function qrToken(token: string, membershipId: string) {
  const res = await apiFetch<unknown>('/v1/access/qr-token', {
    method: 'POST',
    authToken: token,
    body: JSON.stringify({ membershipId }),
  });
  return z.object({ token: z.string(), expiresAt: z.string() }).parse(res);
}

export function membershipStatusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'Active';
    case 'EXPIRED': return 'Expired';
    case 'SUSPENDED': return 'Suspended';
    case 'INACTIVE': return 'Inactive';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
}

export function denialExplanation(code: string | null): string {
  switch (code) {
    case 'MEMBERSHIP_EXPIRED': return 'Membership expired. Renew to restore access.';
    case 'MEMBERSHIP_SUSPENDED': return 'Membership is suspended. Contact your gym.';
    case 'MEMBERSHIP_INACTIVE': return 'Membership is not active.';
    case 'NO_MEMBERSHIP': return 'No membership covers this gym.';
    case 'DOOR_DISABLED': return 'This door is disabled.';
    case 'DOOR_OFFLINE': return 'This door is offline. Try another entrance.';
    case 'OUTSIDE_ACCESS_HOURS': return 'Outside access hours for this door.';
    case 'OUTSIDE_PROXIMITY': return 'You must be near the door (mobile app required).';
    case 'RATE_LIMITED': return 'Too many attempts. Wait and try again.';
    default: return code ?? 'Unknown';
  }
}
