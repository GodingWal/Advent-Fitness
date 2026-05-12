import { isValidEmail, isValidPassword } from '../validation';

describe('isValidEmail', () => {
  it.each([
    ['user@example.com', true],
    ['  user@example.com  ', true],
    ['user.name+tag@sub.domain.io', true],
    ['no-at.example.com', false],
    ['missing-domain@', false],
    ['@no-local.com', false],
    ['', false],
    [null, false],
    [undefined, false],
  ])('%p -> %p', (input, expected) => {
    expect(isValidEmail(input)).toBe(expected);
  });
});

describe('isValidPassword', () => {
  it('requires at least 8 chars by default', () => {
    expect(isValidPassword('short')).toBe(false);
    expect(isValidPassword('longenough')).toBe(true);
  });

  it('honors custom minLength', () => {
    expect(isValidPassword('1234', { minLength: 4 })).toBe(true);
    expect(isValidPassword('123', { minLength: 4 })).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(isValidPassword(null)).toBe(false);
    expect(isValidPassword(12345678)).toBe(false);
  });
});
