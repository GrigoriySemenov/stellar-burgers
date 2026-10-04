import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
} from '../constructor';
import { createOrder } from '../order';
import { bun, secondBun, filling, sauce, order } from './fixtures';

import type { TConstructorState } from '@utils-types';

const initialState: TConstructorState = { bun: null, ingredients: [] };
const populatedState: TConstructorState = {
  bun: { ...bun, id: 'bun-instance' },
  ingredients: [
    { ...filling, id: 'first' },
    { ...sauce, id: 'second' },
    { ...filling, id: 'third' },
  ],
};

describe('Редьюсер burgerConstructor', () => {
  test('возвращает начальное состояние для undefined и неизвестного экшена', () => {
    expect(constructorReducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });
  test('сохраняет существующий конструктор для неизвестного экшена', () => {
    expect(constructorReducer(populatedState, { type: 'UNKNOWN' })).toBe(populatedState);
  });
  describe('Добавление ингредиентов', () => {
    test('добавляет булку в отдельное поле', () => {
      const action = addIngredient(bun);
      expect(constructorReducer(initialState, action)).toEqual({
        bun: action.payload,
        ingredients: [],
      });
      expect(initialState).toEqual({ bun: null, ingredients: [] });
    });
    test('заменяет выбранную булку и сохраняет начинки', () => {
      const action = addIngredient(secondBun);
      expect(constructorReducer(populatedState, action)).toEqual({
        bun: action.payload,
        ingredients: populatedState.ingredients,
      });
      expect(populatedState.bun?._id).toBe(bun._id);
    });
    test.each([filling, sauce])(
      'добавляет $type в конец списка начинок',
      (ingredient) => {
        const action = addIngredient(ingredient);
        expect(constructorReducer(populatedState, action)).toEqual({
          bun: populatedState.bun,
          ingredients: [...populatedState.ingredients, action.payload],
        });
        expect(populatedState.ingredients).toHaveLength(3);
      }
    );
    test('создаёт независимые идентификаторы для одинаковых ингредиентов', () => {
      const first = addIngredient(filling);
      const second = addIngredient(filling);
      const state = constructorReducer(constructorReducer(initialState, first), second);
      expect(first.payload.id).toEqual(expect.any(String));
      expect(first.payload.id).not.toBe(second.payload.id);
      expect(state.ingredients).toEqual([first.payload, second.payload]);
      expect(filling).not.toHaveProperty('id');
    });
  });
  describe('Удаление ингредиентов', () => {
    test('удаляет только выбранный экземпляр по его id', () => {
      expect(constructorReducer(populatedState, removeIngredient('first'))).toEqual({
        bun: populatedState.bun,
        ingredients: populatedState.ingredients.slice(1),
      });
      expect(populatedState.ingredients).toHaveLength(3);
    });
    test('не удаляет булку и не изменяет состав при неизвестном id', () => {
      expect(constructorReducer(populatedState, removeIngredient('missing'))).toEqual(
        populatedState
      );
      expect(
        constructorReducer(populatedState, removeIngredient('bun-instance'))
      ).toEqual(populatedState);
    });
  });
  describe('Перестановка ингредиентов', () => {
    test.each([
      { from: 0, to: 2, expected: ['second', 'third', 'first'] },
      { from: 2, to: 0, expected: ['third', 'first', 'second'] },
      { from: 1, to: 1, expected: ['first', 'second', 'third'] },
    ])('перемещает ингредиент с позиции $from на $to', ({ from, to, expected }) => {
      const result = constructorReducer(populatedState, moveIngredient({ from, to }));
      expect(result.ingredients.map((item) => item.id)).toEqual(expected);
      expect(result.bun).toEqual(populatedState.bun);
      expect(populatedState.ingredients.map((item) => item.id)).toEqual([
        'first',
        'second',
        'third',
      ]);
    });
    test.each([
      { from: -1, to: 0 },
      { from: 0, to: -1 },
      { from: 3, to: 0 },
      { from: 0, to: 3 },
    ])('игнорирует недопустимые позиции $from и $to', (positions) => {
      expect(constructorReducer(populatedState, moveIngredient(positions))).toBe(
        populatedState
      );
    });
  });
  describe('Оформление заказа', () => {
    test('fulfilled очищает булку и начинки', () => {
      expect(
        constructorReducer(
          populatedState,
          createOrder.fulfilled(order, 'request', order.ingredients)
        )
      ).toEqual(initialState);
      expect(populatedState.ingredients).toHaveLength(3);
    });
    test('pending сохраняет собранный бургер до подтверждения заказа', () => {
      expect(
        constructorReducer(
          populatedState,
          createOrder.pending('request', order.ingredients)
        )
      ).toBe(populatedState);
    });
    test('rejected сохраняет бургер для повторной отправки', () => {
      expect(
        constructorReducer(
          populatedState,
          createOrder.rejected(new Error('Нет связи'), 'request', order.ingredients)
        )
      ).toBe(populatedState);
    });
  });
});
