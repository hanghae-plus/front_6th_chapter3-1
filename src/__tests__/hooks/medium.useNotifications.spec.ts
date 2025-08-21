import { act, renderHook, waitFor } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

const testEvents: Event[] = [
  {
    id: 'event-1',
    title: '15분 후 회의',
    date: '2025-10-01',
    startTime: '00:15:00',
    endTime: '00:30:00',
    notificationTime: 15,
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
  },
  {
    id: 'event-2',
    title: '1시간 후 점심',
    date: '2025-10-01',
    startTime: '01:00:00',
    endTime: '02:00:00',
    notificationTime: 30,
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
  },
];

describe('useNotifications', () => {
  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(testEvents));
    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(0);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
    const { result } = renderHook(() => useNotifications(testEvents));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });
    expect(result.current.notifications[0].message).toBe('15분 후 15분 후 회의 일정이 시작됩니다.');
    expect(result.current.notifiedEvents).toContain('event-1');
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
    const { result } = renderHook(() => useNotifications(testEvents));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    act(() => {
      result.current.removeNotification(0);
    });
    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
    const { result } = renderHook(() => useNotifications(testEvents));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.notifications).toHaveLength(1);
  });
});
