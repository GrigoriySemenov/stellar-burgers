import { getIngredientsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TIngredient } from '@utils-types';
type IngredientsState = {
  items: TIngredient[];
  isLoading: boolean;
  error: string | null;
};
const initialState: IngredientsState = { items: [], isLoading: false, error: null };
export const fetchIngredients = createAsyncThunk(
  'ingredients/fetch',
  getIngredientsApi,
  {
    condition: (_, { getState }) =>
      !(
        getState() as {
          ingredients: IngredientsState;
        }
      ).ingredients.isLoading,
  }
);
const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось загрузить ингредиенты';
      });
  },
});
export default ingredientsSlice.reducer;
