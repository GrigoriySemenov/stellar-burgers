import { ProfileMenuUI } from '@ui';
import { fn } from 'storybook/test';

import type { Meta, StoryObj } from '@storybook/react';
const meta = {
  title: 'Example/ProfileMenu',
  component: ProfileMenuUI,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ProfileMenuUI>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DefaultProfileMenu: Story = {
  args: {
    pathname: '/profile',
    handleLogout: fn(),
  },
};
