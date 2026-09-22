import axios from 'axios';
import { checkHealth, DEV_API_URL_KEY } from '../apiHealth';
import { getApiBaseUrl } from '../http';

jest.mock('axios');
jest.mock('../http', () => ({
  getApiBaseUrl: jest.fn(),
}));

const mockedAxios = axios;
const mockedBaseUrl = getApiBaseUrl;

beforeEach(() => {
  jest.clearAllMocks();
  mockedBaseUrl.mockReturnValue('http://192.168.1.2:3000');
});

describe('apiHealth', () => {
  it('returns ok with the base URL when /health succeeds', async () => {
    mockedAxios.get.mockResolvedValue({ status: 200, data: { ok: true } });
    await expect(checkHealth()).resolves.toEqual({
      ok: true,
      url: 'http://192.168.1.2:3000',
      error: null,
    });
    expect(mockedAxios.get).toHaveBeenCalledWith('http://192.168.1.2:3000/health', {
      timeout: 8000,
    });
  });

  it('respects a custom timeout', async () => {
    mockedAxios.get.mockResolvedValue({ status: 200, data: { ok: true } });
    await checkHealth(2500);
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), { timeout: 2500 });
  });

  it('returns unreachable copy when the backend is down', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    const result = await checkHealth();
    expect(result.ok).toBe(false);
    expect(result.url).toBe('http://192.168.1.2:3000');
    expect(result.error).toMatch(/Backend unreachable at http:\/\/192\.168\.1\.2:3000/);
    expect(result.error).toMatch(/npm run dev/);
  });

  it('reports missing configuration without hitting the network', async () => {
    mockedBaseUrl.mockReturnValue('');
    const result = await checkHealth();
    expect(result).toEqual({
      ok: false,
      url: '',
      error: 'EXPO_PUBLIC_API_URL is missing. Run npm run dev.',
    });
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('exposes the dev override storage key', () => {
    expect(DEV_API_URL_KEY).toBe('@volt/dev-api-url');
  });
});
