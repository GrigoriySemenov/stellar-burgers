import { getOrdersApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { logoutUser } from './user';

import type { TOrder } from '@utils-types';
type HistoryState = {
  orders: TOrder[];
  isLoading: boolean;
  error: string | null;
  requestId: string | null;
};
const initialState: HistoryState = {
  orders: [],
  isLoading: false,
  error: null,
  requestId: null,
};
export const fetchHistory = createAsyncThunk('history/fetch', getOrdersApi, {
  condition: (_, { getState }) =>
    !(
      getState() as {
        history: HistoryState;
      }
    ).history.isLoading,
});
const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.orders = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось загрузить историю';
      })
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});
export default historySlice.reducer;
