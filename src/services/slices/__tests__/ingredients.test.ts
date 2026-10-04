import ingredientsReducer, { fetchIngredients } from '../ingredients';
import { bun, filling, sauce } from './fixtures';

const initialState = { items: [], isLoading: false, error: null };

describe('Редьюсер ingredients', () => {
  test('возвращает начальное состояние для undefined и неизвестного экшена', () => {
    expect(ingredientsReducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });
  test('сохраняет существующее состояние для неизвестного экшена', () => {
    const state = { items: [bun], isLoading: false, error: null };
    expect(ingredientsReducer(state, { type: 'UNKNOWN' })).toBe(state);
  });
  test('pending включает загрузку, сбрасывает ошибку и сохраняет ингредиенты', () => {
    const state = { items: [bun], isLoading: false, error: 'Нет связи' };
    const result = ingredientsReducer(state, fetchIngredients.pending('request'));
    expect(result).toEqual({ items: [bun], isLoading: true, error: null });
    expect(state).toEqual({ items: [bun], isLoading: false, error: 'Нет связи' });
  });
  test('fulfilled заменяет ингредиенты ответом сервера и завершает загрузку', () => {
    const state = { items: [bun], isLoading: true, error: null };
    const items = [filling, sauce];
    expect(
      ingredientsReducer(state, fetchIngredients.fulfilled(items, 'request'))
    ).toEqual({ items, isLoading: false, error: null });
    expect(state.items).toEqual([bun]);
  });
  test('fulfilled сохраняет пустой список из ответа сервера', () => {
    const state = { items: [bun], isLoading: true, error: null };
    expect(ingredientsReducer(state, fetchIngredients.fulfilled([], 'request'))).toEqual(
      initialState
    );
  });
  test('rejected завершает загрузку и сохраняет сообщение ошибки', () => {
    const state = { items: [bun], isLoading: true, error: null };
    expect(
      ingredientsReducer(
        state,
        fetchIngredients.rejected(new Error('Нет связи'), 'request')
      )
    ).toEqual({ items: [bun], isLoading: false, error: 'Нет связи' });
    expect(state.isLoading).toBe(true);
  });
  test('rejected без сообщения использует стандартный текст ошибки', () => {
    expect(
      ingredientsReducer(
        { ...initialState, isLoading: true },
        { type: fetchIngredients.rejected.type, error: {} }
      )
    ).toEqual({ ...initialState, error: 'Не удалось загрузить ингредиенты' });
  });
});
