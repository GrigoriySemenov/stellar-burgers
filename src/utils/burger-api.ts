import { setCookie, getCookie, deleteCookie } from './cookie';

import type { TIngredient, TOrder, TUser } from './types';
const URL = process.env.BURGER_API_URL;
const checkResponse = async <T>(res: Response): Promise<T> => {
  const data: unknown = await res.json();
  if (
    !res.ok ||
    (typeof data === 'object' &&
      data !== null &&
      'success' in data &&
      data.success === false)
  )
    throw toApiError(data);
  return data as T;
};
type TServerResponse<T = unknown> = {
  success: boolean;
} & T;
const toApiError = (payload: unknown): Error => {
  const message =
    typeof payload === 'object' &&
    payload !== null &&
    'message' in payload &&
    typeof (
      payload as {
        message: unknown;
      }
    ).message === 'string'
      ? (
          payload as {
            message: string;
          }
        ).message
      : 'Не удалось выполнить запрос к серверу';
  return new Error(message, { cause: payload });
};
type TRefreshResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
}>;
let refreshPromise: Promise<TRefreshResponse> | null = null;
let tokenVersion = 0;
export const clearAuthTokens = (): void => {
  tokenVersion += 1;
  localStorage.removeItem('refreshToken');
  deleteCookie('accessToken');
};
export const refreshToken = (): Promise<TRefreshResponse> => {
  if (refreshPromise) return refreshPromise;
  const version = tokenVersion;
  refreshPromise = fetch(`${URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=utf-8' },
    body: JSON.stringify({ token: localStorage.getItem('refreshToken') }),
  })
    .then((res) => checkResponse<TRefreshResponse>(res))
    .then((data) => {
      if (version !== tokenVersion) throw new Error('Сессия завершена');
      localStorage.setItem('refreshToken', data.refreshToken);
      setCookie('accessToken', data.accessToken);
      return data;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};
export const fetchWithRefresh = async <T>(
  url: RequestInfo,
  options: RequestInit
): Promise<T> => {
  const headers = new Headers(options.headers);
  if (!getCookie('accessToken') && localStorage.getItem('refreshToken')) {
    headers.set('authorization', (await refreshToken()).accessToken);
  }
  try {
    return await checkResponse<T>(await fetch(url, { ...options, headers }));
  } catch (error) {
    if (!(error instanceof Error) || error.message !== 'jwt expired') throw error;
    const token = getCookie('accessToken');
    const accessToken =
      token && token !== headers.get('authorization')
        ? token
        : (await refreshToken()).accessToken;
    headers.set('authorization', accessToken);
    return checkResponse<T>(await fetch(url, { ...options, headers }));
  }
};
type TIngredientsResponse = TServerResponse<{
  data: TIngredient[];
}>;
type TFeedsResponse = TServerResponse<{
  orders: TOrder[];
  total: number;
  totalToday: number;
}>;
export const getIngredientsApi = (): Promise<TIngredient[]> =>
  fetch(`${URL}/ingredients`)
    .then((res) => checkResponse<TIngredientsResponse>(res))
    .then((data) => {
      if (data?.success) return data.data;
      return Promise.reject(toApiError(data));
    });
export const getFeedsApi = (): Promise<TFeedsResponse> =>
  fetch(`${URL}/orders/all`)
    .then((res) => checkResponse<TFeedsResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(toApiError(data));
    });
export const getOrdersApi = (): Promise<TOrder[]> =>
  fetchWithRefresh<TFeedsResponse>(`${URL}/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: getCookie('accessToken'),
    } as HeadersInit,
  }).then((data) => {
    if (data?.success) return data.orders;
    return Promise.reject(toApiError(data));
  });
type TNewOrderResponse = TServerResponse<{
  order: TOrder;
  name: string;
}>;
export const orderBurgerApi = (data: string[]): Promise<TNewOrderResponse> =>
  fetchWithRefresh<TNewOrderResponse>(`${URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: getCookie('accessToken'),
    } as HeadersInit,
    body: JSON.stringify({
      ingredients: data,
    }),
  }).then((data) => {
    if (data?.success) return data;
    return Promise.reject(toApiError(data));
  });
type TOrderResponse = TServerResponse<{
  orders: TOrder[];
}>;
export const getOrderByNumberApi = (number: number): Promise<TOrderResponse> =>
  fetch(`${URL}/orders/${number}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => checkResponse<TOrderResponse>(res));
export type TRegisterData = {
  email: string;
  name: string;
  password: string;
};
type TAuthResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
  user: TUser;
}>;
export const registerUserApi = (data: TRegisterData): Promise<TAuthResponse> =>
  fetch(`${URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(toApiError(data));
    });
export type TLoginData = {
  email: string;
  password: string;
};
export const loginUserApi = (data: TLoginData): Promise<TAuthResponse> =>
  fetch(`${URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(toApiError(data));
    });
export const forgotPasswordApi = (data: { email: string }): Promise<TServerResponse> =>
  fetch(`${URL}/password-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  })
    .then((res) => checkResponse<TServerResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(toApiError(data));
    });
export const resetPasswordApi = (data: {
  password: string;
  token: string;
}): Promise<TServerResponse> =>
  fetch(`${URL}/password-reset/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  })
    .then((res) => checkResponse<TServerResponse>(res))
    .then((data) => {
      if (data?.success) return data;
      return Promise.reject(toApiError(data));
    });
type TUserResponse = TServerResponse<{
  user: TUser;
}>;
export const getUserApi = (): Promise<TUserResponse> =>
  fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    headers: {
      authorization: getCookie('accessToken'),
    } as HeadersInit,
  });
export const updateUserApi = (user: Partial<TRegisterData>): Promise<TUserResponse> =>
  fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: getCookie('accessToken'),
    } as HeadersInit,
    body: JSON.stringify(user),
  });
export const logoutApi = (): Promise<TServerResponse> =>
  fetch(`${URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({
      token: localStorage.getItem('refreshToken'),
    }),
  }).then((res) => checkResponse<TServerResponse>(res));
