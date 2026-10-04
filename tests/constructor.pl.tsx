import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const apiUrl = 'https://stellar-burgers.test/api';
const bunId = '643d69a5c3f7b9001cfa093c';
const secondBunId = '643d69a5c3f7b9001cfa093d';
const fillingId = '643d69a5c3f7b9001cfa0941';
const sauceId = '643d69a5c3f7b9001cfa0942';
const bunName = 'Краторная булка N-200i';
const fillingName = 'Биокотлета из марсианской Магнолии';
const accessToken = 'Bearer playwright-access-token';
const refreshToken = 'playwright-refresh-token';

const ingredientCard = (page: Page, id: string): Locator =>
  page
    .getByTestId('ingredients-content')
    .getByRole('listitem')
    .filter({ has: page.locator(`a[href="/ingredients/${id}"]`) });
const addIngredient = async (page: Page, id: string): Promise<void> => {
  await ingredientCard(page, id)
    .getByRole('button', { name: 'Добавить', exact: true })
    .click();
};
const assembleBurger = async (page: Page): Promise<void> => {
  await addIngredient(page, bunId);
  await addIngredient(page, fillingId);
  await addIngredient(page, sauceId);
};
const expectEmptyConstructor = async (page: Page): Promise<void> => {
  await expect(page.getByTestId('constructor-bun-1')).toHaveCount(0);
  await expect(page.getByTestId('constructor-bun-2')).toHaveCount(0);
  await expect(
    page.getByTestId('constructor').getByText('Выберите булки', { exact: true })
  ).toHaveCount(2);
  await expect(page.getByTestId('constructor-ingredients')).toHaveText(
    'Выберите начинку'
  );
  await expect(
    page.getByTestId('order-summ').getByText('0', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Оформить заказ', exact: true })
  ).toBeDisabled();
};

test.beforeEach(async ({ page }) => {
  await page.route('**/*', async (route) => {
    const { origin, protocol } = new URL(route.request().url());
    if (origin === 'http://127.0.0.1:4173' || protocol === 'data:')
      await route.continue();
    else await route.abort();
  });
  await page.routeFromHAR('tests/hars/ingredients.har', {
    url: `${apiUrl}/ingredients`,
    notFound: 'abort',
    update: false,
  });
  await page.routeFromHAR('tests/hars/user.har', {
    url: `${apiUrl}/auth/**`,
    notFound: 'abort',
    update: false,
  });
  await page.routeFromHAR('tests/hars/orders.har', {
    url: /\/api\/orders(?:\/.*)?$/,
    notFound: 'abort',
    update: false,
  });
});

test.describe('Конструктор: добавление ингредиентов', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });
  test('загружает четыре ингредиента из HAR и показывает пустой конструктор', async ({
    page,
  }) => {
    await expect(page.getByTestId('ingredients-content').getByRole('link')).toHaveCount(
      4
    );
    await expect(ingredientCard(page, bunId)).toContainText(bunName);
    await expectEmptyConstructor(page);
  });
  test('добавляет булку сверху и снизу, заменяет её и пересчитывает стоимость', async ({
    page,
  }) => {
    await addIngredient(page, bunId);
    await expect(page.getByTestId('constructor-bun-1')).toContainText(
      `${bunName} (верх)`
    );
    await expect(page.getByTestId('constructor-bun-2')).toContainText(
      `${bunName} (низ)`
    );
    await expect(
      ingredientCard(page, bunId).getByText('2', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByTestId('order-summ').getByText('200', { exact: true })
    ).toBeVisible();
    await addIngredient(page, secondBunId);
    await expect(page.getByTestId('constructor-bun-1')).toContainText(
      'Флюоресцентная булка R2-D3 (верх)'
    );
    await expect(page.getByTestId('constructor-bun-2')).toContainText(
      'Флюоресцентная булка R2-D3 (низ)'
    );
    await expect(
      ingredientCard(page, bunId).getByText('2', { exact: true })
    ).toHaveCount(0);
    await expect(
      ingredientCard(page, secondBunId).getByText('2', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByTestId('order-summ').getByText('300', { exact: true })
    ).toBeVisible();
  });
  test('добавляет две одинаковые начинки и соус, обновляет счётчик и сумму', async ({
    page,
  }) => {
    await assembleBurger(page);
    await addIngredient(page, fillingId);
    await expect(
      page.getByTestId('constructor-ingredients').getByRole('listitem')
    ).toHaveCount(3);
    await expect(
      page.getByTestId('constructor-ingredients').getByText(fillingName, { exact: true })
    ).toHaveCount(2);
    await expect(page.getByTestId('constructor-ingredients')).toContainText(
      'Соус Spicy-X'
    );
    await expect(
      ingredientCard(page, fillingId).getByText('2', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByTestId('order-summ').getByText('325', { exact: true })
    ).toBeVisible();
  });
});

test.describe('Модальное окно ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await ingredientCard(page, bunId).getByRole('link').click();
    await expect(page.getByTestId('modal')).toBeVisible();
  });
  test('показывает данные выбранного ингредиента и его URL', async ({ page }) => {
    const modal = page.getByTestId('modal');
    await expect(page).toHaveURL(`/ingredients/${bunId}`);
    await expect(
      modal.getByRole('heading', { name: bunName, exact: true })
    ).toBeVisible();
    await expect(modal.getByRole('listitem')).toHaveText([
      'Калории, ккал420',
      'Белки, г80',
      'Жиры, г24',
      'Углеводы, г53',
    ]);
    await expect(modal.getByText(fillingName, { exact: true })).toHaveCount(0);
  });
  test('закрывается по крестику и возвращает маршрут конструктора', async ({ page }) => {
    await page
      .getByTestId('modal')
      .getByRole('button', { name: 'Закрыть', exact: true })
      .click();
    await expect(page.getByTestId('modal')).toHaveCount(0);
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Соберите бургер' })).toBeVisible();
  });
  test('закрывается по клику на оверлей', async ({ page }) => {
    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });
    await expect(page.getByTestId('modal')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });
  test('закрывается по Escape', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('modal')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });
});

test.describe('Оформление заказа', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    await context.addCookies([
      { name: 'accessToken', value: encodeURIComponent(accessToken), url: baseURL! },
    ]);
    await page.addInitScript((token: string) => {
      localStorage.setItem('refreshToken', token);
    }, refreshToken);
    await page.goto('/');
    await expect(
      page.getByRole('link', { name: 'Тестовый пользователь', exact: true })
    ).toBeVisible();
  });
  test('отправляет состав с токеном, показывает номер заказа и очищает конструктор', async ({
    page,
  }) => {
    await assembleBurger(page);
    await expect(
      page.getByTestId('order-summ').getByText('275', { exact: true })
    ).toBeVisible();
    const orderRequest = page.waitForRequest(
      (request) => request.url() === `${apiUrl}/orders` && request.method() === 'POST'
    );
    const feedResponse = page.waitForResponse(`${apiUrl}/orders/all`);
    const historyResponse = page.waitForResponse(
      (response) =>
        response.url() === `${apiUrl}/orders` && response.request().method() === 'GET'
    );
    await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click();
    const request = await orderRequest;
    expect(request.postDataJSON()).toEqual({
      ingredients: [bunId, fillingId, sauceId, bunId],
    });
    expect(await request.headerValue('authorization')).toBe(accessToken);
    expect((await feedResponse).ok()).toBe(true);
    expect((await historyResponse).ok()).toBe(true);
    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByTestId('order-number')).toHaveText('123456');
    await expectEmptyConstructor(page);
    await expect(
      ingredientCard(page, bunId).getByText('2', { exact: true })
    ).toHaveCount(0);
    await expect(
      ingredientCard(page, fillingId).getByText('1', { exact: true })
    ).toHaveCount(0);
    await modal.getByRole('button', { name: 'Закрыть', exact: true }).click();
    await expect(page.getByTestId('modal')).toHaveCount(0);
    await expect(page.getByTestId('order-number')).toHaveCount(0);
  });
  test('при ошибке заказа сохраняет бургер и показывает сообщение', async ({ page }) => {
    await page.routeFromHAR('tests/hars/order-error.har', {
      url: `${apiUrl}/orders`,
      notFound: 'abort',
      update: false,
    });
    await assembleBurger(page);
    await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click();
    await expect(page.getByRole('alert')).toHaveText('Не удалось оформить заказ');
    await expect(page.getByTestId('modal')).toHaveCount(0);
    await expect(page.getByTestId('constructor-bun-1')).toContainText(bunName);
    await expect(page.getByTestId('constructor-bun-2')).toContainText(bunName);
    await expect(
      page.getByTestId('constructor-ingredients').getByRole('listitem')
    ).toHaveCount(2);
    await expect(
      page.getByTestId('order-summ').getByText('275', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Оформить заказ', exact: true })
    ).toBeEnabled();
  });
});
