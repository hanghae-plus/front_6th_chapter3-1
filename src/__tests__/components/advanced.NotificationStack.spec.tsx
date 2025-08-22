import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { NotificationStack } from '../../components/notification/NotificationStack';

describe('NotificationStack', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('알림이 없을 때는 아무것도 렌더링하지 않아야 한다', () => {
      const { container } = render(<NotificationStack notifications={[]} onClose={mockOnClose} />);

      expect(container.firstChild).toBeNull();
    });

    it('알림이 있을 때는 모든 알림을 렌더링해야 한다', () => {
      const notifications = [{ message: '첫 번째 알림' }, { message: '두 번째 알림' }];

      render(<NotificationStack notifications={notifications} onClose={mockOnClose} />);

      expect(screen.getByText('첫 번째 알림')).toBeInTheDocument();
      expect(screen.getByText('두 번째 알림')).toBeInTheDocument();
    });
  });

  describe('사용자 상호작용', () => {
    it('닫기 버튼을 클릭하면 onClose가 올바른 인덱스와 함께 호출되어야 한다', () => {
      const notifications = [{ message: '첫 번째 알림' }, { message: '두 번째 알림' }];

      render(<NotificationStack notifications={notifications} onClose={mockOnClose} />);

      const closeButtons = screen.getAllByRole('button');

      // 첫 번째 알림의 닫기 버튼 클릭
      fireEvent.click(closeButtons[0]);
      expect(mockOnClose).toHaveBeenCalledWith(0);

      // 두 번째 알림의 닫기 버튼 클릭
      fireEvent.click(closeButtons[1]);
      expect(mockOnClose).toHaveBeenCalledWith(1);
    });
  });
});
