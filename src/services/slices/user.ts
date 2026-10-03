import {
  getUserApi,
  loginUserApi,
  registerUserApi,
  updateUserApi,
  logoutApi,
  refreshToken,
  clearAuthTokens,
} from '@api';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';

import { getCookie, setCookie } from '@utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { TUser } from '@utils-types';
type UserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isLoading: boolean;
  error: string | null;
};
const initialState: UserState = {
  user: null,
  isAuthChecked: false,
  isLoading: false,
  error: null,
};
const saveTokens = (data: { accessToken: string; refreshToken: string }): void => {
  setCookie('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
};
const clearTokens = clearAuthTokens;
export const checkUser = createAsyncThunk(
  'user/check',
  async () => {
    if (!getCookie('accessToken') && !localStorage.getItem('refreshToken')) return null;
    try {
      if (!getCookie('accessToken')) await refreshToken();
      return (await getUserApi()).user;
    } catch (error) {
      clearTokens();
      throw error;
    }
  },
  {
    condition: (_, { getState }) =>
      !(
        getState() as {
          user: UserState;
        }
      ).user.isLoading,
  }
);
export const loginUser = createAsyncThunk('user/login', async (data: TLoginData) => {
  const response = await loginUserApi(data);
  saveTokens(response);
  return response.user;
});
export const registerUser = createAsyncThunk(
  'user/register',
  async (data: TRegisterData) => {
    const response = await registerUserApi(data);
    saveTokens(response);
    return response.user;
  }
);
export const updateUser = createAsyncThunk(
  'user/update',
  async (data: Partial<TRegisterData>) => (await updateUserApi(data)).user
);
export const logoutUser = createAsyncThunk('user/logout', async () => {
  await logoutApi();
  clearTokens();
});
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isLoading = false;
        state.isAuthChecked = true;
      })
      .addMatcher(
        isAnyOf(
          checkUser.pending,
          loginUser.pending,
          registerUser.pending,
          updateUser.pending,
          logoutUser.pending
        ),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(
          checkUser.fulfilled,
          loginUser.fulfilled,
          registerUser.fulfilled,
          updateUser.fulfilled
        ),
        (state, action) => {
          state.user = action.payload;
          state.isLoading = false;
          state.isAuthChecked = true;
        }
      )
      .addMatcher(
        isAnyOf(
          checkUser.rejected,
          loginUser.rejected,
          registerUser.rejected,
          updateUser.rejected,
          logoutUser.rejected
        ),
        (state, action) => {
          state.isLoading = false;
          state.isAuthChecked = true;
          state.error = action.error.message ?? 'Не удалось выполнить запрос';
        }
      );
  },
});
export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
