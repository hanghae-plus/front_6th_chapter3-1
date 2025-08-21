import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import NotificationItem from './NotificationItem';

describe('<NotificationItem />', () => {
  it('message가 UI에 표시된다', () => {
    render(<NotificationItem message="회의가 곧 시작됩니다" onClose={vi.fn()} />);

    expect(screen.getByText('회의가 곧 시작됩니다')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument(); // MUI Alert
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<NotificationItem message="알림 메시지" onClose={onClose} />);

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
