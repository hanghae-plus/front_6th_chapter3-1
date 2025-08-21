import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';

import { NotificationStack } from '../../components/NotificationStack';

const setup = (props: Partial<ComponentProps<typeof NotificationStack>> = {}) => {
  const user = userEvent.setup();

  return {
    ...render(
      <NotificationStack
        {...{
          notifications: [],
          onRemoveNotification: () => {},
          ...props,
        }}
      />
    ),
    user,
  };
};

const mockNotifications = [
  { message: '테스트 알림 1' },
  { message: '테스트 알림 2' },
  { message: '테스트 알림 3' },
];

it('알림이 없을 때는 아무것도 렌더링되지 않는다.', () => {
  setup({ notifications: [] });

  const body = document.querySelector('body')!;
  expect(body.textContent).toBe('');
});

it('알림들이 올바르게 렌더링된다.', () => {
  setup({ notifications: mockNotifications });

  expect(screen.getByText('테스트 알림 1')).toBeInTheDocument();
  expect(screen.getByText('테스트 알림 2')).toBeInTheDocument();
  expect(screen.getByText('테스트 알림 3')).toBeInTheDocument();
});

it('각 알림마다 닫기 버튼이 있다.', () => {
  setup({ notifications: mockNotifications });

  const closeButtons = screen.getAllByRole('button');
  expect(closeButtons).toHaveLength(3);
});

it('알림 닫기 버튼을 클릭하면 onRemoveNotification 함수가 호출된다.', async () => {
  const mockOnRemoveNotification = vi.fn();
  const { user } = setup({
    notifications: mockNotifications,
    onRemoveNotification: mockOnRemoveNotification,
  });

  const closeButtons = screen.getAllByRole('button');
  await user.click(closeButtons[0]);

  expect(mockOnRemoveNotification).toBeCalled();
});

it('InfoOutlinedIcon 아이콘이 있다.', () => {
  setup({ notifications: mockNotifications });

  const infoOutlinedIcon = screen.getAllByTestId('InfoOutlinedIcon');
  expect(infoOutlinedIcon).toHaveLength(3);
});
