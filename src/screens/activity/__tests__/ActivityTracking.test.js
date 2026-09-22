import { formatTime, computeElapsedSec } from '../ActivityTrackingScreen';

describe('ActivityTracking timer', () => {
  it('formats mm:ss and h:mm:ss', () => {
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(3661)).toBe('1:01:01');
  });

  it('computes elapsed without drift', () => {
    expect(computeElapsedSec(10, 1000, 4000)).toBe(13);
    expect(computeElapsedSec(10, null, 4000)).toBe(10);
    expect(computeElapsedSec(5, 5000, 1000)).toBe(5);
  });
});
