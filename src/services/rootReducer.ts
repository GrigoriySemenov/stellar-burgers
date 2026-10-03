import { combineReducers } from '@reduxjs/toolkit';

import burgerConstructor from './slices/constructor';
import feed from './slices/feed';
import history from './slices/history';
import ingredients from './slices/ingredients';
import order from './slices/order';
import password from './slices/password';
import user from './slices/user';
export const rootReducer = combineReducers({
  ingredients,
  burgerConstructor,
  user,
  password,
  feed,
  history,
  order,
});
