import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { NotificationToast } from '../../components/notification/NotificationToast';

describe('NotificationToast', () => {
  const mockNotifications = [
    { id: '1', message: '10분 후 회의 일정이 시작됩니다.' },
    { id: '2', message: '15분 후 점심 약속 일정이 시작됩니다.' },
  ];

  const mockOnRemoveNotification = vi.fn();

  beforeEach(() => {
    mockOnRemoveNotification.mockClear();
  });

  it('알림이 없을 때 아무것도 렌더링하지 않는다', () => {
    const { container } = render(
      <NotificationToast notifications={[]} onRemoveNotification={mockOnRemoveNotification} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('알림이 있을 때 모든 알림을 표시한다', () => {
    render(
      <NotificationToast
        notifications={mockNotifications}
        onRemoveNotification={mockOnRemoveNotification}
      />
    );

    expect(screen.getByText('10분 후 회의 일정이 시작됩니다.')).toBeInTheDocument();
    expect(screen.getByText('15분 후 점심 약속 일정이 시작됩니다.')).toBeInTheDocument();
  });

  it('알림의 닫기 버튼을 클릭하면 onRemoveNotification이 올바른 인덱스로 호출된다', async () => {
    const user = userEvent.setup();

    render(
      <NotificationToast
        notifications={mockNotifications}
        onRemoveNotification={mockOnRemoveNotification}
      />
    );

    const closeButtons = screen.getAllByRole('button');

    // 첫 번째 알림의 닫기 버튼 클릭
    await user.click(closeButtons[0]);
    expect(mockOnRemoveNotification).toHaveBeenCalledWith(0);
  });
});
