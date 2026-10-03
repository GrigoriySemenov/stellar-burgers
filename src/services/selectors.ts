import type { RootState } from './store';
import type { TIngredient, TOrder } from '@utils-types';
export const selectIngredientsState = (state: RootState): RootState['ingredients'] =>
  state.ingredients;
export const selectIngredients = (state: RootState): TIngredient[] =>
  state.ingredients.items;
export const selectConstructor = (state: RootState): RootState['burgerConstructor'] =>
  state.burgerConstructor;
export const selectUserState = (state: RootState): RootState['user'] => state.user;
export const selectUser = (state: RootState): RootState['user']['user'] =>
  state.user.user;
export const selectPassword = (state: RootState): RootState['password'] =>
  state.password;
export const selectFeed = (state: RootState): RootState['feed'] => state.feed;
export const selectHistory = (state: RootState): RootState['history'] => state.history;
export const selectOrder = (state: RootState): RootState['order'] => state.order;
export const selectIngredientById = (
  state: RootState,
  id: string | undefined
): TIngredient | undefined => state.ingredients.items.find((item) => item._id === id);
export const selectOrderByNumber = (
  state: RootState,
  number: number
): TOrder | undefined =>
  state.feed.orders.find((order) => order.number === number) ??
  state.history.orders.find((order) => order.number === number) ??
  (state.order.order?.number === number ? state.order.order : undefined);
