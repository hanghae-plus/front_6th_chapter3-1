import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { NotificationPanel } from '../../components/NotificationPanel';

describe('NotificationPanel', () => {
  const mockOnRemove = vi.fn();

  const mockNotifications = [
    { id: '1', message: '알림 메시지 1' },
    { id: '2', message: '알림 메시지 2' },
  ];

  const defaultProps = {
    notifications: mockNotifications,
    onRemove: mockOnRemove,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('알림이 없을 때는 렌더링되지 않는다', () => {
    const { container } = render(<NotificationPanel notifications={[]} onRemove={mockOnRemove} />);

    expect(container.firstChild).toBeNull();
  });

  it('알림이 있을 때 모든 알림이 표시된다', () => {
    render(<NotificationPanel {...defaultProps} />);

    expect(screen.getByText('알림 메시지 1')).toBeInTheDocument();
    expect(screen.getByText('알림 메시지 2')).toBeInTheDocument();
  });

  it('각 알림에 닫기 버튼이 표시된다', () => {
    render(<NotificationPanel {...defaultProps} />);

    const closeButtons = screen.getAllByRole('button');
    expect(closeButtons).toHaveLength(2);
  });

  it('닫기 버튼 클릭 시 onRemove가 올바른 인덱스로 호출된다', async () => {
    const user = userEvent.setup();
    render(<NotificationPanel {...defaultProps} />);

    const closeButtons = screen.getAllByRole('button');
    await user.click(closeButtons[0]);

    expect(mockOnRemove).toHaveBeenCalledWith(0);
  });

  it('두 번째 알림의 닫기 버튼 클릭 시 올바른 인덱스로 호출된다', async () => {
    const user = userEvent.setup();
    render(<NotificationPanel {...defaultProps} />);

    const closeButtons = screen.getAllByRole('button');
    await user.click(closeButtons[1]);

    expect(mockOnRemove).toHaveBeenCalledWith(1);
  });

  it('알림이 하나만 있을 때도 올바르게 표시된다', () => {
    const singleNotification = [{ id: '1', message: '단일 알림 메시지' }];
    render(<NotificationPanel notifications={singleNotification} onRemove={mockOnRemove} />);

    expect(screen.getByText('단일 알림 메시지')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('알림들이 info severity로 표시된다', () => {
    render(<NotificationPanel {...defaultProps} />);

    const alerts = screen.getAllByRole('alert');
    alerts.forEach((alert) => {
      expect(alert).toHaveClass('MuiAlert-standardInfo');
    });
  });
});
