import { forgotPasswordApi, resetPasswordApi } from '@api';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
export const forgotPassword = createAsyncThunk(
  'password/forgot',
  async (email: string) => {
    await forgotPasswordApi({ email });
    sessionStorage.setItem('resetPassword', 'true');
  }
);
export const resetPassword = createAsyncThunk(
  'password/reset',
  async (data: { password: string; token: string }) => {
    await resetPasswordApi(data);
    sessionStorage.removeItem('resetPassword');
  }
);
const passwordSlice = createSlice({
  name: 'password',
  initialState: { isLoading: false, error: null as string | null },
  reducers: {
    clearPasswordError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(isAnyOf(forgotPassword.pending, resetPassword.pending), (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(
        isAnyOf(forgotPassword.fulfilled, resetPassword.fulfilled),
        (state) => {
          state.isLoading = false;
        }
      )
      .addMatcher(
        isAnyOf(forgotPassword.rejected, resetPassword.rejected),
        (state, action) => {
          state.isLoading = false;
          state.error = action.error.message ?? 'Не удалось восстановить пароль';
        }
      );
  },
});
export const { clearPasswordError } = passwordSlice.actions;
export default passwordSlice.reducer;
