import { fetchWithRefresh, getIngredientsApi, clearAuthTokens } from './burger-api';
import { getCookie, setCookie } from './cookie';
jest.mock('./cookie');
const removeItemMock = jest.fn();
const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
const respond = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
beforeEach(() => {
  jest.resetAllMocks();
  globalThis.fetch = fetchMock;
  jest.mocked(getCookie).mockReturnValue('Bearer old-token');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: jest.fn(() => 'refresh-token'),
      setItem: jest.fn(),
      removeItem: removeItemMock,
    },
  });
});
test('API failures in a successful HTTP response still reject', async () => {
  fetchMock.mockResolvedValue(respond({ success: false, message: 'Ошибка API' }));
  await expect(getIngredientsApi()).rejects.toThrow('Ошибка API');
});
test('expired access token is refreshed and the original request is retried', async () => {
  fetchMock
    .mockResolvedValueOnce(respond({ message: 'jwt expired' }, 403))
    .mockResolvedValueOnce(
      respond({
        success: true,
        accessToken: 'Bearer new-token',
        refreshToken: 'new-refresh',
      })
    )
    .mockResolvedValueOnce(respond({ success: true, value: 42 }));
  const body = JSON.stringify({ name: 'Тест' });
  await expect(
    fetchWithRefresh('/auth/user', {
      method: 'PATCH',
      body,
      headers: { authorization: 'Bearer old-token' },
    })
  ).resolves.toEqual({ success: true, value: 42 });
  expect(setCookie).toHaveBeenCalledWith('accessToken', 'Bearer new-token');
  const request = fetchMock.mock.calls[2][1];
  expect(new Headers(request?.headers).get('authorization')).toBe('Bearer new-token');
  expect(request?.body).toBe(body);
  expect(request?.method).toBe('PATCH');
});
test('parallel expired requests share one refresh request', async () => {
  fetchMock.mockImplementation((url, options) => {
    if (typeof url === 'string' && url.endsWith('/auth/token'))
      return Promise.resolve(
        respond({
          success: true,
          accessToken: 'Bearer new-token',
          refreshToken: 'new-refresh',
        })
      );
    return Promise.resolve(
      new Headers(options?.headers).get('authorization') === 'Bearer new-token'
        ? respond({ success: true })
        : respond({ message: 'jwt expired' }, 403)
    );
  });
  await Promise.all([
    fetchWithRefresh('/first', { headers: { authorization: 'Bearer old-token' } }),
    fetchWithRefresh('/second', { headers: { authorization: 'Bearer old-token' } }),
  ]);
  expect(
    fetchMock.mock.calls.filter(
      ([url]) => typeof url === 'string' && url.endsWith('/auth/token')
    )
  ).toHaveLength(1);
});
test('missing access cookie is restored before a private request', async () => {
  jest.mocked(getCookie).mockReturnValue(undefined);
  fetchMock
    .mockResolvedValueOnce(
      respond({
        success: true,
        accessToken: 'Bearer restored',
        refreshToken: 'new-refresh',
      })
    )
    .mockResolvedValueOnce(respond({ success: true }));
  await fetchWithRefresh('/orders', { headers: {} });
  expect(new Headers(fetchMock.mock.calls[1][1]?.headers).get('authorization')).toBe(
    'Bearer restored'
  );
});
test('refresh failure rejects without replaying the private request', async () => {
  fetchMock
    .mockResolvedValueOnce(respond({ message: 'jwt expired' }, 403))
    .mockResolvedValueOnce(respond({ message: 'Token is invalid' }, 403));
  await expect(
    fetchWithRefresh('/orders', { headers: { authorization: 'Bearer old-token' } })
  ).rejects.toThrow('Token is invalid');
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
test('logout removes the refresh token', () => {
  clearAuthTokens();
  expect(removeItemMock).toHaveBeenCalledWith('refreshToken');
});
