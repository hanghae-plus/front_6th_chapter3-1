import { render, screen } from '@testing-library/react';

import NotificationContainer from './NotificationContainer';

describe('NotificationContainer', () => {
  it('알림이 없으면 렌더링되지 않음', () => {
    const { container } = render(
      <NotificationContainer notifications={[]} onRemoveNotification={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('알림 목록이 올바르게 렌더링됨', () => {
    const notifications = [{ message: '테스트 알림 1' }, { message: '테스트 알림 2' }];

    render(<NotificationContainer notifications={notifications} onRemoveNotification={() => {}} />);

    expect(screen.getByText('테스트 알림 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 알림 2')).toBeInTheDocument();
  });
});
