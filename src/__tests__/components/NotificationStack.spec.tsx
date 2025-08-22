import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import NotificationStack from '../../components/NotificationStack';

const mockNotifications = [
  { message: '첫 번째 알림' },
  { message: '두 번째 알림' },
  { message: '세 번째 알림' },
];

const mockProps = {
  notifications: mockNotifications,
  onRemoveNotification: vi.fn(),
};

const renderNotificationStack = (props = {}) => {
  const defaultProps = { ...mockProps, ...props };
  return render(<NotificationStack {...defaultProps} />);
};

describe('NotificationStack 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('알림이 있을 때 알림 스택이 올바르게 렌더링된다', () => {
      renderNotificationStack();

      expect(screen.getByTestId('notification-stack')).toBeInTheDocument();
    });

    it('모든 알림이 올바르게 표시된다', () => {
      renderNotificationStack();

      expect(screen.getByTestId('notification-message-0')).toHaveTextContent('첫 번째 알림');
      expect(screen.getByTestId('notification-message-1')).toHaveTextContent('두 번째 알림');
      expect(screen.getByTestId('notification-message-2')).toHaveTextContent('세 번째 알림');
    });

    it('각 알림에 닫기 버튼이 표시된다', () => {
      renderNotificationStack();

      expect(screen.getByTestId('notification-close-0')).toBeInTheDocument();
      expect(screen.getByTestId('notification-close-1')).toBeInTheDocument();
      expect(screen.getByTestId('notification-close-2')).toBeInTheDocument();
    });

    it('알림이 없을 때는 렌더링되지 않는다', () => {
      renderNotificationStack({ notifications: [] });

      expect(screen.queryByTestId('notification-stack')).not.toBeInTheDocument();
    });
  });

  describe('상호작용 테스트', () => {
    it('첫 번째 알림의 닫기 버튼 클릭 시 onRemoveNotification이 호출된다', async () => {
      const user = userEvent.setup();
      const mockOnRemoveNotification = vi.fn();
      renderNotificationStack({ onRemoveNotification: mockOnRemoveNotification });

      const closeButton = screen.getByTestId('notification-close-0');
      await user.click(closeButton);

      expect(mockOnRemoveNotification).toHaveBeenCalledTimes(1);
      expect(mockOnRemoveNotification).toHaveBeenCalledWith(0);
    });

    it('두 번째 알림의 닫기 버튼 클릭 시 올바른 인덱스로 onRemoveNotification이 호출된다', async () => {
      const user = userEvent.setup();
      const mockOnRemoveNotification = vi.fn();
      renderNotificationStack({ onRemoveNotification: mockOnRemoveNotification });

      const closeButton = screen.getByTestId('notification-close-1');
      await user.click(closeButton);

      expect(mockOnRemoveNotification).toHaveBeenCalledTimes(1);
      expect(mockOnRemoveNotification).toHaveBeenCalledWith(1);
    });

    it('세 번째 알림의 닫기 버튼 클릭 시 올바른 인덱스로 onRemoveNotification이 호출된다', async () => {
      const user = userEvent.setup();
      const mockOnRemoveNotification = vi.fn();
      renderNotificationStack({ onRemoveNotification: mockOnRemoveNotification });

      const closeButton = screen.getByTestId('notification-close-2');
      await user.click(closeButton);

      expect(mockOnRemoveNotification).toHaveBeenCalledTimes(1);
      expect(mockOnRemoveNotification).toHaveBeenCalledWith(2);
    });
  });

  describe('레이아웃 테스트', () => {
    it('알림 스택이 고정 위치에 표시된다', () => {
      renderNotificationStack();

      const notificationStack = screen.getByTestId('notification-stack');
      expect(notificationStack).toHaveStyle({
        position: 'fixed',
      });
    });
  });
});
