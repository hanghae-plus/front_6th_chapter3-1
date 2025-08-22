import { render, screen, fireEvent } from '@testing-library/react';
import { vi, test, describe, expect } from 'vitest';

import { NotificationStack } from '../../components/NotificationStack';

describe('NotificationStack', () => {
  test('알림이 없으면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(
      <NotificationStack notifications={[]} onCloseNotification={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  test('알림이 있으면 메시지가 표시된다', () => {
    const notifications = [{ message: '첫 번째 알림' }, { message: '두 번째 알림' }];

    render(<NotificationStack notifications={notifications} onCloseNotification={vi.fn()} />);

    expect(screen.getByText('첫 번째 알림')).toBeInTheDocument();
    expect(screen.getByText('두 번째 알림')).toBeInTheDocument();
  });

  test('알림 닫기 버튼 클릭 시 onCloseNotification이 호출된다', () => {
    const mockClose = vi.fn();
    const notifications = [{ message: '테스트 알림' }];

    render(<NotificationStack notifications={notifications} onCloseNotification={mockClose} />);

    const closeButton = screen.getByRole('button', { name: '알림 닫기' });
    fireEvent.click(closeButton);

    expect(mockClose).toHaveBeenCalledWith(0);
  });
});
