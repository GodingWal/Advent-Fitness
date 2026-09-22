import { config } from '../../config';
import type { AccessProvider } from './AccessProvider';

export class KisiProviderError extends Error {
  code: 'PROVIDER_UNCONFIGURED' | 'PROVIDER_ERROR' | 'OFFLINE';
  constructor(code: 'PROVIDER_UNCONFIGURED' | 'PROVIDER_ERROR' | 'OFFLINE', message?: string) {
    super(message ?? code);
    this.name = 'KisiProviderError';
    this.code = code;
  }
}

function requireConfig(): { baseUrl: string; apiKey: string } {
  const baseUrl = (config.kisiApiBaseUrl || '').replace(/\/$/, '');
  const apiKey = config.kisiApiKey || '';
  if (!baseUrl || !apiKey) {
    throw new KisiProviderError('PROVIDER_UNCONFIGURED', 'Access provider is not configured');
  }
  return { baseUrl, apiKey };
}

export class KisiProvider implements AccessProvider {
  async unlockDoor(input: { providerDoorId: string; userId: string }): Promise<{
    success: boolean;
    providerEventId?: string | null;
  }> {
    const { baseUrl, apiKey } = requireConfig();
    void input.userId;
    let res: Response;
    try {
      res = await fetch(`${baseUrl}/locks/${encodeURIComponent(input.providerDoorId)}/unlock`, {
        method: 'POST',
        headers: {
          Authorization: `KISI-LOGIN ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
    } catch {
      throw new KisiProviderError('PROVIDER_ERROR', 'Access provider request failed');
    }
    if (res.status === 404) {
      throw new KisiProviderError('PROVIDER_ERROR', 'Access provider request failed');
    }
    if (res.status === 429) {
      throw new KisiProviderError('PROVIDER_ERROR', 'Access provider request failed');
    }
    if (!res.ok) {
      throw new KisiProviderError('PROVIDER_ERROR', 'Access provider request failed');
    }
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    let providerEventId: string | null = null;
    if (data && typeof data === 'object' && data !== null) {
      const record = data as Record<string, unknown>;
      const candidate = record.event_id ?? record.id;
      if (typeof candidate === 'string' || typeof candidate === 'number') {
        providerEventId = String(candidate);
      }
    }
    return { success: true, providerEventId };
  }

  async getDoorStatus(providerDoorId: string): Promise<'ONLINE' | 'OFFLINE' | 'UNKNOWN'> {
    const { baseUrl, apiKey } = requireConfig();
    let res: Response;
    try {
      res = await fetch(`${baseUrl}/locks/${encodeURIComponent(providerDoorId)}`, {
        method: 'GET',
        headers: { Authorization: `KISI-LOGIN ${apiKey}` },
      });
    } catch {
      return 'UNKNOWN';
    }
    if (!res.ok) return 'UNKNOWN';
    try {
      const data = (await res.json()) as { online?: boolean };
      if (typeof data.online === 'boolean') return data.online ? 'ONLINE' : 'OFFLINE';
    } catch {
      return 'UNKNOWN';
    }
    return 'UNKNOWN';
  }
}
