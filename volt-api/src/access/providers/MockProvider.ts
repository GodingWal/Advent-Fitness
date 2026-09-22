import type { AccessProvider } from './AccessProvider';

export class MockProviderError extends Error {
  code: 'OFFLINE' | 'DENIED' | 'TIMEOUT' | 'RATE_LIMITED';
  constructor(code: 'OFFLINE' | 'DENIED' | 'TIMEOUT' | 'RATE_LIMITED', message?: string) {
    super(message ?? code);
    this.name = 'MockProviderError';
    this.code = code;
  }
}

export class MockProvider implements AccessProvider {
  async unlockDoor(input: { providerDoorId: string; userId: string }): Promise<{
    success: boolean;
    providerEventId?: string | null;
  }> {
    void input.userId;
    switch (input.providerDoorId) {
      case 'mock-front-door':
        return { success: true, providerEventId: `mock_${Date.now()}` };
      case 'mock-offline-door':
        throw new MockProviderError('OFFLINE', 'Door is offline');
      case 'mock-reject-door':
        throw new MockProviderError('DENIED', 'Provider denied unlock');
      case 'mock-timeout-door':
        throw new MockProviderError('TIMEOUT', 'Provider request timed out');
      case 'mock-ratelimit-door':
        throw new MockProviderError('RATE_LIMITED', 'Provider rate limit exceeded');
      default:
        return { success: true, providerEventId: `mock_${Date.now()}` };
    }
  }

  async getDoorStatus(providerDoorId: string): Promise<'ONLINE' | 'OFFLINE' | 'UNKNOWN'> {
    if (providerDoorId === 'mock-offline-door') return 'OFFLINE';
    if (providerDoorId === 'mock-front-door') return 'ONLINE';
    return 'ONLINE';
  }
}
