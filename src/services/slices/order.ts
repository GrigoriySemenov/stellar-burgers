import { getOrderByNumberApi, orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchFeed } from './feed';
import { fetchHistory } from './history';
import { logoutUser } from './user';

import type { TOrder } from '@utils-types';
type OrderState = {
  createdOrder: TOrder | null;
  order: TOrder | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  createError: string | null;
  requestId: string | null;
};
const initialState: OrderState = {
  createdOrder: null,
  order: null,
  isLoading: false,
  isCreating: false,
  error: null,
  createError: null,
  requestId: null,
};
export const createOrder = createAsyncThunk(
  'order/create',
  async (ingredients: string[], { dispatch }) => {
    const response = await orderBurgerApi(ingredients);
    void dispatch(fetchFeed());
    void dispatch(fetchHistory());
    return response.order;
  },
  {
    condition: (_, { getState }) =>
      !(
        getState() as {
          order: OrderState;
        }
      ).order.isCreating,
  }
);
export const fetchOrder = createAsyncThunk('order/fetch', async (number: number) => {
  const response = await getOrderByNumberApi(number);
  if (!response.orders.length) throw new Error('Заказ не найден');
  return response.orders[0];
});
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearCreatedOrder: (state) => {
      state.createdOrder = null;
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
        state.createdOrder = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isCreating = false;
        state.createdOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.error.message ?? 'Не удалось оформить заказ';
      })
      .addCase(fetchOrder.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.order = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.isLoading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось загрузить заказ';
      })
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});
export const { clearCreatedOrder } = orderSlice.actions;
export default orderSlice.reducer;
