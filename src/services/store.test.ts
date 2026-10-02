import * as api from '@api';
import { configureStore } from '@reduxjs/toolkit';

import { setCookie, getCookie } from '@utils/cookie';

import { rootReducer } from './rootReducer';
import { addIngredient, removeIngredient, moveIngredient } from './slices/constructor';
import { fetchFeed } from './slices/feed';
import { fetchHistory } from './slices/history';
import { fetchIngredients } from './slices/ingredients';
import { createOrder, fetchOrder, clearCreatedOrder } from './slices/order';
import { forgotPassword, resetPassword } from './slices/password';
import {
  checkUser,
  loginUser,
  registerUser,
  updateUser,
  logoutUser,
} from './slices/user';

import type { TIngredient, TOrder } from '@utils-types';

jest.mock('@api');
jest.mock('@utils/cookie');
const bun: TIngredient = {
  _id: 'bun',
  type: 'bun',
  name: 'Булка',
  price: 100,
  proteins: 1,
  fat: 2,
  carbohydrates: 3,
  calories: 4,
  image: '',
  image_large: '',
  image_mobile: '',
};
const filling: TIngredient = {
  ...bun,
  _id: 'filling',
  type: 'main',
  name: 'Начинка',
  price: 50,
};
const order: TOrder = {
  _id: 'order',
  number: 42,
  status: 'done',
  name: 'Бургер',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ingredients: ['bun', 'filling', 'bun'],
};
const user = { name: 'Тест', email: 'test@example.com' };
const auth = {
  success: true,
  user,
  accessToken: 'Bearer test-token',
  refreshToken: 'test-refresh',
};
const makeStore = (): ReturnType<
  typeof configureStore<ReturnType<typeof rootReducer>>
> => configureStore({ reducer: rootReducer });
let storage: Map<string, string>;

beforeEach(() => {
  jest.resetAllMocks();
  storage = new Map();
  const memoryStorage = {
    getItem: jest.fn((key: string) => storage.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => storage.set(key, value)),
    removeItem: jest.fn((key: string) => storage.delete(key)),
  };
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: memoryStorage,
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: memoryStorage,
  });
});

test('initializes all state domains', () => {
  expect(Object.keys(makeStore().getState()).sort()).toEqual([
    'burgerConstructor',
    'feed',
    'history',
    'ingredients',
    'order',
    'password',
    'user',
  ]);
});
test('replaces a bun and gives duplicate fillings independent identifiers', () => {
  const store = makeStore();
  store.dispatch(addIngredient(bun));
  store.dispatch(addIngredient({ ...bun, _id: 'second-bun' }));
  store.dispatch(addIngredient(filling));
  store.dispatch(addIngredient(filling));
  const state = store.getState().burgerConstructor;
  expect(state.bun?._id).toBe('second-bun');
  expect(state.ingredients).toHaveLength(2);
  expect(state.ingredients[0].id).not.toBe(state.ingredients[1].id);
  store.dispatch(removeIngredient(state.ingredients[0].id));
  expect(store.getState().burgerConstructor.ingredients).toEqual([state.ingredients[1]]);
});
test('moves fillings without mutating the previous state and ignores invalid positions', () => {
  const store = makeStore();
  store.dispatch(addIngredient(filling));
  store.dispatch(addIngredient({ ...filling, _id: 'second' }));
  const before = store.getState().burgerConstructor;
  store.dispatch(moveIngredient({ from: 0, to: 1 }));
  expect(store.getState().burgerConstructor.ingredients.map((item) => item._id)).toEqual(
    ['second', 'filling']
  );
  expect(before.ingredients.map((item) => item._id)).toEqual(['filling', 'second']);
  store.dispatch(moveIngredient({ from: 0, to: -1 }));
  expect(store.getState().burgerConstructor.ingredients[0]._id).toBe('second');
});
test('loads ingredients and exposes pending and rejected states', async () => {
  const store = makeStore();
  jest.mocked(api.getIngredientsApi).mockResolvedValue([bun, filling]);
  const request = store.dispatch(fetchIngredients());
  expect(store.getState().ingredients.isLoading).toBe(true);
  await request;
  expect(store.getState().ingredients.items).toEqual([bun, filling]);
  jest.mocked(api.getIngredientsApi).mockRejectedValue(new Error('Нет связи'));
  await store.dispatch(fetchIngredients());
  expect(store.getState().ingredients.error).toBe('Нет связи');
  expect(store.getState().ingredients.isLoading).toBe(false);
});
test('loads feed totals and personal history', async () => {
  const store = makeStore();
  jest
    .mocked(api.getFeedsApi)
    .mockResolvedValue({ success: true, orders: [order], total: 20, totalToday: 3 });
  jest.mocked(api.getOrdersApi).mockResolvedValue([order]);
  await store.dispatch(fetchFeed());
  await store.dispatch(fetchHistory());
  expect(store.getState().feed).toMatchObject({
    orders: [order],
    total: 20,
    totalToday: 3,
    isLoading: false,
  });
  expect(store.getState().history.orders).toEqual([order]);
});
test('successful order clears constructor and refreshes both order lists', async () => {
  const store = makeStore();
  store.dispatch(addIngredient(bun));
  store.dispatch(addIngredient(filling));
  jest
    .mocked(api.orderBurgerApi)
    .mockResolvedValue({ success: true, name: order.name, order });
  jest
    .mocked(api.getFeedsApi)
    .mockResolvedValue({ success: true, orders: [order], total: 1, totalToday: 1 });
  jest.mocked(api.getOrdersApi).mockResolvedValue([order]);
  const ids = ['bun', 'filling', 'bun'];
  await store.dispatch(createOrder(ids));
  expect(api.orderBurgerApi).toHaveBeenCalledWith(ids);
  expect(store.getState().burgerConstructor).toEqual({ bun: null, ingredients: [] });
  expect(store.getState().order.createdOrder).toEqual(order);
  expect(api.getFeedsApi).toHaveBeenCalled();
  expect(api.getOrdersApi).toHaveBeenCalled();
  store.dispatch(clearCreatedOrder());
  expect(store.getState().order.createdOrder).toBeNull();
});
test('failed order preserves the burger and blocks duplicate submissions while pending', async () => {
  const store = makeStore();
  store.dispatch(addIngredient(bun));
  jest.mocked(api.orderBurgerApi).mockRejectedValue(new Error('Ошибка заказа'));
  const request = store.dispatch(createOrder(['bun', 'bun']));
  await store.dispatch(createOrder(['bun', 'bun']));
  await request;
  expect(api.orderBurgerApi).toHaveBeenCalledTimes(1);
  expect(store.getState().burgerConstructor.bun?._id).toBe('bun');
  expect(store.getState().order).toMatchObject({
    isCreating: false,
    createError: 'Ошибка заказа',
  });
});
test('stale order responses do not overwrite the current order', () => {
  const store = makeStore();
  store.dispatch(fetchOrder.pending('first', 1));
  store.dispatch(fetchOrder.pending('second', 42));
  store.dispatch(fetchOrder.fulfilled(order, 'second', 42));
  store.dispatch(fetchOrder.fulfilled({ ...order, number: 1 }, 'first', 1));
  expect(store.getState().order.order?.number).toBe(42);
});
test('missing order returns a visible error', async () => {
  const store = makeStore();
  jest.mocked(api.getOrderByNumberApi).mockResolvedValue({ success: true, orders: [] });
  await store.dispatch(fetchOrder(42));
  expect(store.getState().order).toMatchObject({
    isLoading: false,
    error: 'Заказ не найден',
  });
});
test('checks an anonymous session without making a user request', async () => {
  const store = makeStore();
  await store.dispatch(checkUser());
  expect(api.getUserApi).not.toHaveBeenCalled();
  expect(store.getState().user).toMatchObject({ user: null, isAuthChecked: true });
});
test('restores an authenticated session using the refresh token', async () => {
  const store = makeStore();
  storage.set('refreshToken', 'refresh');
  jest.mocked(api.getUserApi).mockResolvedValue({ success: true, user });
  await store.dispatch(checkUser());
  expect(api.refreshToken).toHaveBeenCalledTimes(1);
  expect(store.getState().user.user).toEqual(user);
});
test.each([loginUser, registerUser])(
  'login and registration store user and tokens',
  async (action) => {
    const store = makeStore();
    jest.mocked(api.loginUserApi).mockResolvedValue(auth);
    jest.mocked(api.registerUserApi).mockResolvedValue(auth);
    await store.dispatch(action({ ...user, password: 'test-password' }));
    expect(store.getState().user.user).toEqual(user);
    expect(setCookie).toHaveBeenCalledWith('accessToken', auth.accessToken);
    expect(storage.get('refreshToken')).toBe(auth.refreshToken);
  }
);
test('profile update saves the returned user', async () => {
  const store = makeStore();
  jest
    .mocked(api.updateUserApi)
    .mockResolvedValue({ success: true, user: { ...user, name: 'Новое имя' } });
  await store.dispatch(updateUser({ name: 'Новое имя' }));
  expect(api.updateUserApi).toHaveBeenCalledWith({ name: 'Новое имя' });
  expect(store.getState().user.user?.name).toBe('Новое имя');
});
test('logout clears private state and ignores an outstanding history response', async () => {
  const store = makeStore();
  jest.mocked(api.logoutApi).mockResolvedValue({ success: true });
  store.dispatch(
    loginUser.fulfilled(user, 'login', { email: user.email, password: 'test-password' })
  );
  store.dispatch(fetchHistory.pending('history'));
  await store.dispatch(logoutUser());
  store.dispatch(fetchHistory.fulfilled([order], 'history'));
  expect(store.getState().user.user).toBeNull();
  expect(store.getState().history.orders).toEqual([]);
  expect(api.clearAuthTokens).toHaveBeenCalled();
});
test('login failure does not authenticate the user', async () => {
  const store = makeStore();
  jest.mocked(api.loginUserApi).mockRejectedValue(new Error('Неверный пароль'));
  await store.dispatch(loginUser({ email: user.email, password: 'wrong' }));
  expect(store.getState().user).toMatchObject({
    user: null,
    isLoading: false,
    error: 'Неверный пароль',
  });
});
test('password recovery allows reset only after a successful request', async () => {
  const store = makeStore();
  jest
    .mocked(api.forgotPasswordApi)
    .mockRejectedValueOnce(new Error('Ошибка'))
    .mockResolvedValueOnce({ success: true });
  await store.dispatch(forgotPassword(user.email));
  expect(storage.has('resetPassword')).toBe(false);
  await store.dispatch(forgotPassword(user.email));
  expect(storage.get('resetPassword')).toBe('true');
  jest.mocked(api.resetPasswordApi).mockResolvedValue({ success: true });
  await store.dispatch(resetPassword({ password: 'new-password', token: 'test-code' }));
  expect(storage.has('resetPassword')).toBe(false);
});
test('failed session restoration clears unusable tokens', async () => {
  const store = makeStore();
  jest.mocked(getCookie).mockReturnValue('invalid-token');
  jest.mocked(api.getUserApi).mockRejectedValue(new Error('jwt malformed'));
  await store.dispatch(checkUser());
  expect(store.getState().user.isAuthChecked).toBe(true);
  expect(api.clearAuthTokens).toHaveBeenCalled();
});
