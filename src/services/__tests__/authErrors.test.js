import {
  backendUnreachableMessage,
  friendlyAuthError,
  isEmailTakenError,
  isNetworkError,
} from '../authErrors';
import { strings } from '../../i18n/strings';

describe('authErrors', () => {
  describe('isNetworkError', () => {
    it('flags axios network errors, timeouts, and missing base URL', () => {
      expect(isNetworkError(new Error('Network Error'))).toBe(true);
      expect(isNetworkError({ code: 'ECONNABORTED', message: 'timeout of 0ms exceeded' })).toBe(
        true
      );
      expect(isNetworkError(new Error('EXPO_PUBLIC_API_URL is missing. Run npm run dev.'))).toBe(
        true
      );
      expect(isNetworkError({ request: {}, message: 'no response' })).toBe(true);
    });

    it('does not flag server responses', () => {
      expect(isNetworkError({ response: { status: 401, data: {} } })).toBe(false);
      expect(isNetworkError(null)).toBe(false);
    });
  });

  describe('isEmailTakenError', () => {
    it('detects 409 EMAIL_TAKEN responses', () => {
      expect(isEmailTakenError({ response: { status: 409, data: { code: 'EMAIL_TAKEN' } } })).toBe(
        true
      );
      expect(isEmailTakenError({ response: { status: 409, data: {} } })).toBe(true);
      expect(isEmailTakenError({ response: { status: 400, data: {} } })).toBe(false);
    });
  });

  describe('friendlyAuthError', () => {
    it('maps duplicate email to friendly copy with login/reset hints', () => {
      const err = {
        response: { status: 409, data: { code: 'EMAIL_TAKEN', message: 'taken' } },
      };
      expect(friendlyAuthError(err)).toBe(strings.auth.emailTaken);
    });

    it('maps network/timeout errors to backend-unreachable copy', () => {
      const msg = friendlyAuthError(new Error('Network Error'), {
        url: 'http://192.168.1.2:3000',
      });
      expect(msg).toMatch(/Backend unreachable/);
      expect(msg).toContain('http://192.168.1.2:3000');
      expect(msg).toMatch(/npm run dev/);
    });

    it('prefers server messages for non-network errors', () => {
      const err = { response: { status: 401, data: { message: 'Invalid credentials' } } };
      expect(friendlyAuthError(err)).toBe('Invalid credentials');
    });

    it('falls back to generic copy when there is nothing to show', () => {
      expect(friendlyAuthError({}, { fallback: 'custom' })).toBe('custom');
      expect(friendlyAuthError(null)).toBe(strings.auth.genericError);
    });
  });

  describe('backendUnreachableMessage', () => {
    it('includes the URL and the dev command', () => {
      const msg = backendUnreachableMessage('http://10.0.0.2:3000');
      expect(msg).toContain('http://10.0.0.2:3000');
      expect(msg).toMatch(/npm run dev/);
    });
  });
});
