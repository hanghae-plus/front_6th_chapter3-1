import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { createEvent, parseHM } from '../utils.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const mockEvents: Event[] = [];

  const { result } = renderHook(() => useNotifications(mockEvents));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-08-21T09:00:00'));

  const mockEvent = createEvent({
    id: '1',
    title: '이벤트',
    date: '2025-08-21',
    startTime: '09:10',
    endTime: '10:00',
    notificationTime: 10,
  });

  const { result } = renderHook(() => useNotifications([mockEvent]));

  await act(async () => {
    await vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].message).toBe('10분 후 이벤트 일정이 시작됩니다.');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
  vi.setSystemTime(new Date('2025-08-21T09:00:00'));

  const mockEvents = [
    createEvent({
      id: '1',
      title: '이벤트',
      date: '2025-08-21',
      startTime: '09:10',
      endTime: '10:00',
      notificationTime: 10,
    }),
    createEvent({
      id: '2',
      title: '이벤트2',
      date: '2025-08-21',
      startTime: '09:05',
      endTime: '10:00',
      notificationTime: 5,
    }),
  ];

  const { result } = renderHook(() => useNotifications(mockEvents));

  await act(async () => {
    await vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(2);

  // 첫번째 인덱스 알림 제거
  await act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].id).toBe('2');
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
  vi.setSystemTime(new Date('2025-08-21T09:00:00'));

  const mockEvent = createEvent({
    id: '1',
    title: '이벤트',
    date: '2025-08-21',
    startTime: '09:10',
    endTime: '10:00',
    notificationTime: 10,
  });

  const { result } = renderHook(() => useNotifications([mockEvent]));

  await act(async () => {
    await vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].id).toBe('1');

  // 중복 알림
  await act(async () => {
    await vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].id).toBe('1');
});
