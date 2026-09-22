import { strings } from '../../../i18n/strings';
import { mapDenyToCopy } from '../../../screens/gym/GymAccessScreen';

describe('access copy', () => {
  it('exposes an access: strings section', () => {
    expect(strings.access).toBeDefined();
    expect(strings.access.unlock).toBeDefined();
    expect(strings.access.doorUnavailable).toMatch(/unavailable/i);
    expect(strings.access.noMemberships).toMatch(/No active memberships/);
  });

  it('maps deny codes to user copy', () => {
    expect(mapDenyToCopy('MEMBERSHIP_INACTIVE')).toBe(strings.access.deniedMembershipInactive);
    expect(mapDenyToCopy('RATE_LIMITED')).toBe(strings.access.deniedRateLimited);
    expect(mapDenyToCopy('PROXIMITY_REQUIRED')).toBe(strings.access.deniedProximity);
    expect(mapDenyToCopy('OUTSIDE_HOURS')).toBe(strings.access.deniedOutsideHours);
    expect(mapDenyToCopy('DOOR_OFFLINE')).toBe(strings.access.deniedOffline);
    expect(mapDenyToCopy('NO_ACCESS')).toBe(strings.access.deniedNoAccess);
    expect(mapDenyToCopy('UNKNOWN_CODE', null)).toBe(strings.access.deniedGeneric);
  });

  it('maps HTTP 429 to rate-limit copy', () => {
    expect(mapDenyToCopy('429')).toBe(strings.access.deniedRateLimited);
  });
});
