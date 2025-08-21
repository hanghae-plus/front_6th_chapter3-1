import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import NotificationList from '../../components/NotificationList';

it('알림이 있을 경우 화면에 표시된다', () => {
  const mockData = {
    notifications: [
      { id: '1', message: '알림 1' },
      { id: '2', message: '알림 2' },
    ],
    setNotifications: vi.fn(),
  };

  render(<NotificationList {...mockData} />);

  expect(screen.getByText('알림 1')).toBeInTheDocument();
  expect(screen.getByText('알림 2')).toBeInTheDocument();
});

it('알림의 닫기 버튼을 누를 시 알림 제거 함수가 호출된다.', () => {
  const mockData = {
    notifications: [{ id: '1', message: '알림 1' }],
    setNotifications: vi.fn(),
  };

  render(<NotificationList {...mockData} />);

  const closeButton = screen.getByRole('button');
  fireEvent.click(closeButton);

  expect(mockData.setNotifications).toHaveBeenCalled();
});
