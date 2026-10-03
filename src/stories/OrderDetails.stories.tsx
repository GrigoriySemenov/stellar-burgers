import { OrderDetailsUI } from '@ui';

import { withModalSurface } from './modal-surface-decorator';

import type { Meta, StoryObj } from '@storybook/react';
const meta = {
  title: 'Example/OrderDetails',
  component: OrderDetailsUI,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [withModalSurface],
} satisfies Meta<typeof OrderDetailsUI>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DefaultOrderDetails: Story = {
  args: {
    orderNumber: 12,
  },
};
