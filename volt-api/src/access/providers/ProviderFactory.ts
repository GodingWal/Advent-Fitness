import type { AccessProvider } from './AccessProvider';
import { KisiProvider } from './KisiProvider';
import { MockProvider } from './MockProvider';

const mockProvider = new MockProvider();
const kisiProvider = new KisiProvider();

export function getAccessProvider(name: string): AccessProvider {
  const normalized = (name || '').toUpperCase();
  if (normalized === 'MOCK') return mockProvider;
  if (normalized === 'KISI') return kisiProvider;
  return mockProvider;
}
