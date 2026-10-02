import type { Decorator } from '@storybook/react';
export const withModalSurface: Decorator = (Story) => (
  <div
    style={{
      width: 'fit-content',
      margin: 20,
      padding: '40px 40px 60px',
      borderRadius: 40,
      background: 'var(--background)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <Story />
  </div>
);
