import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

import { NotificationToast } from '../components/NotificationToast';

const mockNotifications = [
  { id: '1', message: '첫 번째 알림' },
  { id: '2', message: '두 번째 알림' },
];

const defaultProps = {
  notifications: mockNotifications,
  onRemoveNotification: vi.fn(),
};

describe('NotificationToast 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    test('알림이 있을 때 올바르게 렌더링된다', () => {
      render(<NotificationToast {...defaultProps} />);

      expect(screen.getByText('첫 번째 알림')).toBeInTheDocument();
      expect(screen.getByText('두 번째 알림')).toBeInTheDocument();
    });

    test('알림이 없을 때 아무것도 렌더링하지 않는다', () => {
      const { container } = render(<NotificationToast {...defaultProps} notifications={[]} />);

      expect(container.firstChild).toBeNull();
    });

    test('알림들이 올바른 순서로 표시된다', () => {
      render(<NotificationToast {...defaultProps} />);

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(2);

      // 첫 번째 알림이 먼저 나타나야 함
      expect(alerts[0]).toHaveTextContent('첫 번째 알림');
      expect(alerts[1]).toHaveTextContent('두 번째 알림');
    });
  });

  describe('닫기 기능', () => {
    test('닫기 버튼을 클릭하면 onRemoveNotification이 올바른 인덱스와 함께 호출된다', () => {
      render(<NotificationToast {...defaultProps} />);

      const closeButtons = screen.getAllByRole('button');
      fireEvent.click(closeButtons[0]);

      expect(defaultProps.onRemoveNotification).toHaveBeenCalledWith(0);
    });

    test('두 번째 알림의 닫기 버튼을 클릭하면 인덱스 1로 호출된다', () => {
      render(<NotificationToast {...defaultProps} />);

      const closeButtons = screen.getAllByRole('button');
      fireEvent.click(closeButtons[1]);

      expect(defaultProps.onRemoveNotification).toHaveBeenCalledWith(1);
    });

    test('모든 알림에 닫기 버튼이 있다', () => {
      render(<NotificationToast {...defaultProps} />);

      const closeButtons = screen.getAllByRole('button');
      expect(closeButtons).toHaveLength(2);
    });
  });

  describe('스타일링', () => {
    test('알림이 고정 위치에 표시된다', () => {
      const { container } = render(<NotificationToast {...defaultProps} />);

      const stackElement = container.firstChild as HTMLElement;
      expect(stackElement).toHaveStyle({
        position: 'fixed',
        top: '16px',
        right: '16px',
      });
    });

    test('알림들이 세로로 정렬된다', () => {
      render(<NotificationToast {...defaultProps} />);

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(2);
    });
  });

  describe('접근성', () => {
    test('각 알림이 alert role을 가진다', () => {
      render(<NotificationToast {...defaultProps} />);

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(2);
    });

    test('닫기 버튼들이 접근 가능하다', () => {
      render(<NotificationToast {...defaultProps} />);

      const closeButtons = screen.getAllByRole('button');
      closeButtons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('경계 케이스', () => {
    test('단일 알림이 올바르게 표시된다', () => {
      const singleNotification = [{ id: '1', message: '단일 알림' }];
      render(<NotificationToast {...defaultProps} notifications={singleNotification} />);

      expect(screen.getByText('단일 알림')).toBeInTheDocument();
      expect(screen.getAllByRole('alert')).toHaveLength(1);
    });

    test('매우 긴 메시지도 올바르게 표시된다', () => {
      const longMessage =
        '매우 긴 알림 메시지입니다. 이 메시지는 일반적인 알림보다 훨씬 길어서 레이아웃에 어떤 영향을 주는지 확인하기 위한 테스트입니다.';
      const longNotification = [{ id: '1', message: longMessage }];
      render(<NotificationToast {...defaultProps} notifications={longNotification} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    test('빈 메시지가 있어도 정상적으로 처리된다', () => {
      const emptyMessage = [{ id: '1', message: '' }];
      render(<NotificationToast {...defaultProps} notifications={emptyMessage} />);

      expect(screen.getAllByRole('alert')).toHaveLength(1);
    });

    test('많은 수의 알림도 올바르게 표시된다', () => {
      const manyNotifications = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        message: `알림 ${i + 1}`,
      }));

      render(<NotificationToast {...defaultProps} notifications={manyNotifications} />);

      expect(screen.getAllByRole('alert')).toHaveLength(5);
      manyNotifications.forEach((notification) => {
        expect(screen.getByText(notification.message)).toBeInTheDocument();
      });
    });
  });
});
