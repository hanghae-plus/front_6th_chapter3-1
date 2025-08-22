import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NotificationStack } from '../../components/NotificationStack';

const mockNotifications = [
  { id: '1', message: '일정이 추가되었습니다.' },
  { id: '2', message: '일정이 수정되었습니다.' },
];

describe('NotificationStack', () => {
  let removedIndexes: number[] = [];

  const handleRemoveNotification = (index: number) => {
    removedIndexes.push(index);
  };

  beforeEach(() => {
    removedIndexes = [];
  });

  it('알림 목록이 비어있을 때 아무것도 렌더링하지 않는다', () => {
    const { container } = render(
      <NotificationStack notifications={[]} onRemoveNotification={handleRemoveNotification} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('알림 목록을 올바르게 표시한다', () => {
    render(
      <NotificationStack
        notifications={mockNotifications}
        onRemoveNotification={handleRemoveNotification}
      />
    );

    expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();
    expect(screen.getByText('일정이 수정되었습니다.')).toBeInTheDocument();
  });

  it('각 알림에 닫기 버튼이 표시된다', () => {
    render(
      <NotificationStack
        notifications={mockNotifications}
        onRemoveNotification={handleRemoveNotification}
      />
    );

    // CloseIcon testid로 닫기 버튼 찾기
    const closeButtons = screen.getAllByTestId('CloseIcon');
    expect(closeButtons).toHaveLength(mockNotifications.length);
  });

  it('닫기 버튼을 클릭하면 올바른 인덱스로 onRemoveNotification이 호출된다', async () => {
    const user = userEvent.setup();

    render(
      <NotificationStack
        notifications={mockNotifications}
        onRemoveNotification={handleRemoveNotification}
      />
    );

    // IconButton으로 닫기 버튼 찾기
    const closeButtons = screen.getAllByRole('button');

    // 첫 번째 알림의 닫기 버튼 클릭
    await user.click(closeButtons[0]);
    expect(removedIndexes).toContain(0);

    // 두 번째 알림의 닫기 버튼 클릭
    await user.click(closeButtons[1]);
    expect(removedIndexes).toContain(1);
    expect(removedIndexes).toEqual([0, 1]);
  });

  it('알림이 하나만 있을 때도 올바르게 동작한다', async () => {
    const user = userEvent.setup();
    const singleNotification = [{ id: '1', message: '단일 알림' }];

    render(
      <NotificationStack
        notifications={singleNotification}
        onRemoveNotification={handleRemoveNotification}
      />
    );

    expect(screen.getByText('단일 알림')).toBeInTheDocument();

    const closeButton = screen.getByRole('button');
    await user.click(closeButton);
    expect(removedIndexes).toContain(0);
  });

  it('알림 스택이 올바른 위치에 고정되어 있다', () => {
    render(
      <NotificationStack
        notifications={mockNotifications}
        onRemoveNotification={handleRemoveNotification}
      />
    );

    const stack = screen.getByText('일정이 추가되었습니다.').closest('[class*="MuiStack"]');
    expect(stack).toHaveStyle({
      position: 'fixed',
      top: '16px',
      right: '16px',
    });
  });
});
