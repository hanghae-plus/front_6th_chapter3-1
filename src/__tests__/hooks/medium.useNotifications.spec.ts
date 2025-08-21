import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

afterEach(() => {
  vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const events: Event[] = [];
  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.useRealTimers();
  vi.useFakeTimers();

  const baseTime = new Date('2025-08-01T10:00:00');
  vi.setSystemTime(baseTime);

  const events: Event[] = [
    {
      id: '1',
      title: '미팅',
      date: '2025-08-01',
      startTime: '10:10', // 10분 후 시작
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);

  act(() => {
    vi.advanceTimersByTime(1100); // 1초보다 조금 더 진행해서 interval이 실행되도록
  });

  expect(result.current.notifications.length).toBeGreaterThan(0);
  expect(result.current.notifiedEvents).toContain('1');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const events: Event[] = [];
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    result.current.setNotifications([
      { id: '1', message: '첫 번째 알림' },
      { id: '2', message: '두 번째 알림' },
      { id: '3', message: '세 번째 알림' },
    ]);
  });

  expect(result.current.notifications).toHaveLength(3);

  act(() => {
    result.current.removeNotification(1);
  });

  expect(result.current.notifications).toHaveLength(2);
  expect(result.current.notifications[0].id).toBe('1');
  expect(result.current.notifications[1].id).toBe('3');
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.useRealTimers();
  vi.useFakeTimers();

  const baseTime = new Date('2025-08-01T10:00:00');
  vi.setSystemTime(baseTime);

  const events: Event[] = [
    {
      id: '1',
      title: '미팅',
      date: '2025-08-01',
      startTime: '10:10', // 10분 후 시작
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1100);
  });

  const initialNotificationCount = result.current.notifications.length;
  expect(result.current.notifiedEvents).toContain('1');

  act(() => {
    vi.advanceTimersByTime(1100);
  });

  expect(result.current.notifications.length).toBe(initialNotificationCount);
  expect(result.current.notifiedEvents).toContain('1');
});
