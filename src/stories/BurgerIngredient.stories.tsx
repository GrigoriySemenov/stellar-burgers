import { BurgerIngredientUI } from '@ui';
import { fn } from 'storybook/test';

import ingredientImage from './assets/ingredient-placeholder.svg';

import type { Meta, StoryObj } from '@storybook/react';
const meta = {
  title: 'Example/BurgerIngredient',
  component: BurgerIngredientUI,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story): React.JSX.Element => (
      <ul style={{ width: 'fit-content', margin: 20, listStyle: 'none', padding: 0 }}>
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof BurgerIngredientUI>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DefaultIngredient: Story = {
  args: {
    ingredient: {
      _id: '111',
      name: 'Булка',
      type: 'top',
      proteins: 12,
      fat: 33,
      carbohydrates: 22,
      calories: 33,
      price: 123,
      image: ingredientImage,
      image_large: ingredientImage,
      image_mobile: ingredientImage,
    },
    count: 2,
    locationState: {
      background: {
        hash: '',
        key: 'eitkep27',
        pathname: '/',
        search: '',
        state: null,
      },
    },
    handleAdd: fn(),
  },
};
