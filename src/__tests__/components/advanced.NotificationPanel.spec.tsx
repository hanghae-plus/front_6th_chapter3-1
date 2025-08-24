import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { NotificationPanel } from '../../components/NotificationPanel';

const mockNotifications = [
  { id: '1', message: '일정이 추가되었습니다.' },
  { id: '2', message: '일정이 수정되었습니다.' },
  { id: '3', message: '일정이 삭제되었습니다.' },
];

describe('NotificationPanel', () => {
  const mockOnRemoveNotification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('조건부 렌더링', () => {
    test('알림이 없으면 아무것도 표시하지 않아야 한다', () => {
      // Given & When: 빈 알림 배열로 렌더링하면
      const { container } = render(
        <NotificationPanel notifications={[]} onRemoveNotification={mockOnRemoveNotification} />
      );

      // Then: 아무것도 렌더링되지 않아야 한다
      expect(container.firstChild).toBeNull();
    });

    test('알림이 있으면 모든 알림 메시지가 표시되어야 한다', () => {
      // Given & When: 여러 알림과 함께 렌더링하면
      render(
        <NotificationPanel
          notifications={mockNotifications}
          onRemoveNotification={mockOnRemoveNotification}
        />
      );

      // Then: 모든 알림 메시지가 표시되어야 한다
      expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();
      expect(screen.getByText('일정이 수정되었습니다.')).toBeInTheDocument();
      expect(screen.getByText('일정이 삭제되었습니다.')).toBeInTheDocument();
    });
  });

  describe('알림 제거 기능', () => {
    test('X 버튼 클릭 시 해당 알림의 인덱스로 onRemoveNotification이 호출되어야 한다', async () => {
      // Given: 여러 알림이 있는 상태로 렌더링
      const user = userEvent.setup();
      render(
        <NotificationPanel
          notifications={mockNotifications}
          onRemoveNotification={mockOnRemoveNotification}
        />
      );

      // When: 첫 번째 알림의 X 버튼을 클릭하면
      const closeButtons = screen.getAllByRole('button');
      await user.click(closeButtons[0]);

      // Then: 인덱스 0으로 onRemoveNotification이 호출되어야 한다
      expect(mockOnRemoveNotification).toHaveBeenCalledWith(0);
      expect(mockOnRemoveNotification).toHaveBeenCalledTimes(1);
    });

    test('다른 알림의 X 버튼 클릭 시 올바른 인덱스로 호출되어야 한다', async () => {
      // Given: 여러 알림이 있는 상태로 렌더링
      const user = userEvent.setup();
      render(
        <NotificationPanel
          notifications={mockNotifications}
          onRemoveNotification={mockOnRemoveNotification}
        />
      );

      // When: 두 번째 알림의 X 버튼을 클릭하면
      const closeButtons = screen.getAllByRole('button');
      await user.click(closeButtons[1]);

      // Then: 인덱스 1로 onRemoveNotification이 호출되어야 한다
      expect(mockOnRemoveNotification).toHaveBeenCalledWith(1);
    });
  });
});
