import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { Noti } from '../../elements/Noti';
import { useNotifications } from '../../hooks/useNotifications';
import { createMockEvent } from '../utils';

// useNotifications 훅을 mock
const mockSetNotifications = vi.fn();
vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    notifications: [],
    setNotifications: mockSetNotifications,
  })),
}));

describe('Noti: 알림 컴포넌트', () => {
  const mockEvents = [createMockEvent(1), createMockEvent(2)];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('알림이 없으면 아무것도 렌더링하지 않아야 한다', () => {
    render(<Noti events={mockEvents} />);

    // 알림이 없으면 아무것도 보이지 않음
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('알림이 있으면 알림 메시지를 표시해야 한다', () => {
    const mockNotifications = [{ id: '1', message: '10분 후 회의 일정이 시작됩니다.' }];

    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      setNotifications: mockSetNotifications,
      notifiedEvents: [],
      removeNotification: vi.fn(),
    });

    render(<Noti events={mockEvents} />);

    // 알림 메시지들이 화면에 표시되는지 확인
    expect(screen.getByText('10분 후 회의 일정이 시작됩니다.')).toBeInTheDocument();
  });

  it('여러 개의 알림이 있으면 모두 표시되어야 한다', () => {
    const mockNotifications = [
      { id: '1', message: '첫 번째 알림' },
      { id: '2', message: '두 번째 알림' },
      { id: '3', message: '세 번째 알림' },
    ];

    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      setNotifications: mockSetNotifications,
      notifiedEvents: [],
      removeNotification: vi.fn(),
    });

    render(<Noti events={mockEvents} />);

    // 모든 알림이 표시되는지 확인
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(3);

    expect(screen.getByText('첫 번째 알림')).toBeInTheDocument();
    expect(screen.getByText('두 번째 알림')).toBeInTheDocument();
    expect(screen.getByText('세 번째 알림')).toBeInTheDocument();
  });

  it('닫기 버튼을 클릭하면 해당 알림이 제거되어야 한다', () => {
    const mockNotifications = [
      { id: '1', message: '첫 번째 알림' },
      { id: '2', message: '두 번째 알림' },
    ];

    vi.mocked(useNotifications).mockReturnValue({
      notifications: mockNotifications,
      setNotifications: mockSetNotifications,
      notifiedEvents: [],
      removeNotification: vi.fn(),
    });

    render(<Noti events={mockEvents} />);

    // 첫 번째 닫기 버튼 클릭
    const closeButtons = screen.getAllByRole('button');
    fireEvent.click(closeButtons[0]);

    // setNotifications가 호출되었는지 확인
    expect(mockSetNotifications).toHaveBeenCalledTimes(1);
    expect(mockSetNotifications).toHaveBeenCalledWith(expect.any(Function));
  });
});
