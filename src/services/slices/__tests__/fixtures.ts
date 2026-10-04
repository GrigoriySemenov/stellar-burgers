import type { TIngredient, TOrder } from '@utils-types';

export const bun: TIngredient = {
  _id: 'bun',
  name: 'Краторная булка',
  type: 'bun',
  price: 100,
  proteins: 10,
  fat: 20,
  carbohydrates: 30,
  calories: 250,
  image: 'bun.png',
  image_large: 'bun-large.png',
  image_mobile: 'bun-mobile.png',
};
export const secondBun: TIngredient = {
  ...bun,
  _id: 'second-bun',
  name: 'Флюоресцентная булка',
  price: 150,
};
export const filling: TIngredient = {
  ...bun,
  _id: 'filling',
  name: 'Котлета',
  type: 'main',
  price: 50,
};
export const sauce: TIngredient = {
  ...bun,
  _id: 'sauce',
  name: 'Соус',
  type: 'sauce',
  price: 25,
};
export const order: TOrder = {
  _id: 'order',
  number: 123456,
  status: 'done',
  name: 'Бургер',
  createdAt: '2026-01-01T12:00:00.000Z',
  updatedAt: '2026-01-01T12:00:00.000Z',
  ingredients: [bun._id, filling._id, sauce._id, bun._id],
};
