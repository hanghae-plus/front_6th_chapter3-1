import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Notifications } from '../../components/Notifications';

describe('Notifications', () => {
  it('notifications 메시지 닫기 버튼 클릭 시 메시지가 사라진다', async () => {
    const mockOnRemoveNotification = vi.fn();
    render(
      <Notifications
        notifications={[{ message: '10분 후 팀 회의 일정이 시작됩니다.' }]}
        onRemoveNotification={mockOnRemoveNotification}
      />
    );

    const closeButton = screen.getByLabelText('Close');
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(mockOnRemoveNotification).toHaveBeenCalledWith(0);
    });
  });
});
