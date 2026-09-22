export type AuthorizeCode =
  | 'MEMBERSHIP_INACTIVE'
  | 'MEMBERSHIP_EXPIRED'
  | 'MEMBERSHIP_SUSPENDED'
  | 'NO_MEMBERSHIP'
  | 'DOOR_DISABLED'
  | 'DOOR_OFFLINE'
  | 'DOOR_NOT_FOUND'
  | 'OUTSIDE_ACCESS_HOURS'
  | 'OUTSIDE_PROXIMITY'
  | 'PROVIDER_ERROR'
  | 'RATE_LIMITED';

export class AuthorizeError extends Error {
  code: AuthorizeCode;
  statusCode: number;
  constructor(code: AuthorizeCode, message?: string, statusCode = 200) {
    super(message ?? code);
    this.name = 'AuthorizeError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
