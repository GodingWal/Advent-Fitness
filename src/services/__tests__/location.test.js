import { haversineMiles, pathDistanceMiles, applyPrivacyZone } from '../location';

describe('haversineMiles', () => {
  it('returns null when either point is missing', () => {
    expect(haversineMiles(null, { latitude: 0, longitude: 0 })).toBeNull();
    expect(haversineMiles({ latitude: 0, longitude: 0 }, null)).toBeNull();
  });

  it('returns 0 for identical points', () => {
    const p = { latitude: 32.7157, longitude: -117.1611 };
    expect(haversineMiles(p, p)).toBeCloseTo(0, 5);
  });

  it('approximates a known distance (San Diego to LA ≈ 111 mi)', () => {
    const sd = { latitude: 32.7157, longitude: -117.1611 };
    const la = { latitude: 34.0522, longitude: -118.2437 };
    const d = haversineMiles(sd, la);
    expect(d).toBeGreaterThan(108);
    expect(d).toBeLessThan(115);
  });
});

describe('pathDistanceMiles', () => {
  it('returns 0 for empty or single-point paths', () => {
    expect(pathDistanceMiles([])).toBe(0);
    expect(pathDistanceMiles([{ latitude: 0, longitude: 0 }])).toBe(0);
    expect(pathDistanceMiles(null)).toBe(0);
  });

  it('sums consecutive segments', () => {
    const path = [
      { latitude: 32.7157, longitude: -117.1611 },
      { latitude: 32.7257, longitude: -117.1611 },
      { latitude: 32.7357, longitude: -117.1611 },
    ];
    const d = pathDistanceMiles(path);
    expect(d).toBeGreaterThan(1.3);
    expect(d).toBeLessThan(1.5);
  });
});

describe('applyPrivacyZone', () => {
  const zone = {
    enabled: true,
    center: { latitude: 32.748, longitude: -117.1492 },
    radiusMi: 0.15,
  };

  it('returns coords unchanged when zone disabled', () => {
    const coords = [{ latitude: 32.748, longitude: -117.1492 }];
    expect(applyPrivacyZone(coords, { ...zone, enabled: false })).toBe(coords);
  });

  it('strips points inside the zone', () => {
    const inside = { latitude: 32.748, longitude: -117.1492 };
    const outside = { latitude: 32.9, longitude: -117.2 };
    const result = applyPrivacyZone([inside, outside], zone);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(outside);
  });

  it('keeps points exactly at the zone boundary out (since d <= radius is filtered)', () => {
    const result = applyPrivacyZone([zone.center], zone);
    expect(result).toHaveLength(0);
  });
});
