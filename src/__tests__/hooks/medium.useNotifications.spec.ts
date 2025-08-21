import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

describe('useNotifications', () => {
  it('초기 상태에서는 알림이 없어야 한다', () => {
    const mockEvents: Event[] = [];
    const { result } = renderHook(() => useNotifications(mockEvents));

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(0);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const mockEvent: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const { result } = renderHook(() => useNotifications([mockEvent]));

    const eventDate = new Date('2025-01-15T10:00:00');

    const notificationTime = new Date(eventDate);
    notificationTime.setMinutes(notificationTime.getMinutes() - mockEvent.notificationTime);

    vi.setSystemTime(notificationTime);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toEqual([
      { id: '1', message: '10분 후 테스트 이벤트 일정이 시작됩니다.' },
    ]);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const mockEvent: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const { result } = renderHook(() => useNotifications([mockEvent]));

    const eventDate = new Date('2025-01-15T10:00:00');

    const notificationTime = new Date(eventDate);
    notificationTime.setMinutes(notificationTime.getMinutes() - mockEvent.notificationTime);

    vi.setSystemTime(notificationTime);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toEqual([
      { id: '1', message: '10분 후 테스트 이벤트 일정이 시작됩니다.' },
    ]);

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toEqual([]);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const mockEvent: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const { result } = renderHook(() => useNotifications([mockEvent]));

    const eventDate = new Date('2025-01-15T10:00:00');

    const notificationTime = new Date(eventDate);
    notificationTime.setMinutes(notificationTime.getMinutes() - mockEvent.notificationTime);

    vi.setSystemTime(notificationTime);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toEqual([
      { id: '1', message: '10분 후 테스트 이벤트 일정이 시작됩니다.' },
    ]);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toEqual([
      { id: '1', message: '10분 후 테스트 이벤트 일정이 시작됩니다.' },
    ]);
  });
});
