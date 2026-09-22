import { sanitizeArray, sanitizeSettings, APP_STORAGE_KEYS } from '../AppContext';

describe('AppContext persistence helpers', () => {
  it('exposes versioned storage keys', () => {
    expect(APP_STORAGE_KEYS.savedSpots).toContain('@volt/v1/');
    expect(Object.keys(APP_STORAGE_KEYS)).toEqual(
      expect.arrayContaining(['savedSpots', 'recordedRoutes', 'settings'])
    );
  });

  it('sanitizeArray passes arrays through, rejects other', () => {
    expect(sanitizeArray([1])).toEqual([1]);
    expect(sanitizeArray(null)).toEqual([]);
    expect(sanitizeArray('x')).toEqual([]);
  });

  it('sanitizeSettings merges over fallback', () => {
    const fallback = { a: 1, b: 2 };
    expect(sanitizeSettings({ b: 3 }, fallback)).toEqual({ a: 1, b: 3 });
    expect(sanitizeSettings(null, fallback)).toEqual(fallback);
  });
});
