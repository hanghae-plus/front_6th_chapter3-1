import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications';
import type { Event } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { parseHM } from '../utils';

beforeEach(() => {
  vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  const MINUTE_MS = 1000 * 60;
  const notificationTime = 5;
  const baseTime = Date.now();

  vi.useFakeTimers();
  vi.setSystemTime(new Date(baseTime + notificationTime * MINUTE_MS));

  const mockEvents: Event[] = [
    {
      id: '1',
      title: '알림 테스트 이벤트',
      date: formatDate(new Date()),
      startTime: parseHM(baseTime + 10 * MINUTE_MS),
      endTime: parseHM(baseTime + 70 * MINUTE_MS),
      description: '10분 후 시작되는 이벤트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime,
    },
  ];

  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => vi.advanceTimersByTime(1000));
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toContain('1');

  vi.useRealTimers();
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
  const MINUTE_MS = 1000 * 60;
  const notificationTime = 5;
  const baseTime = Date.now();

  vi.useFakeTimers();
  vi.setSystemTime(new Date(baseTime + notificationTime * MINUTE_MS));

  const mockEvents: Event[] = [
    {
      id: '1',
      title: '알림 테스트 이벤트 1',
      date: formatDate(new Date()),
      startTime: parseHM(baseTime + 10 * MINUTE_MS),
      endTime: parseHM(baseTime + 70 * MINUTE_MS),
      description: '이벤트 1',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime,
    },
    {
      id: '2',
      title: '알림 테스트 이벤트 2',
      date: formatDate(new Date()),
      startTime: parseHM(baseTime + 10 * MINUTE_MS),
      endTime: parseHM(baseTime + 140 * MINUTE_MS),
      description: '이벤트 2',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime,
    },
  ];

  const { result } = renderHook(() => useNotifications(mockEvents));

  await act(async () => vi.advanceTimersByTime(1000));
  expect(result.current.notifications).toHaveLength(2);

  act(() => result.current.removeNotification(0));
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].id).toBe('2');

  vi.useRealTimers();
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
  const MINUTE_MS = 1000 * 60;
  const notificationTime = 5;
  const baseTime = Date.now();

  vi.useFakeTimers();
  vi.setSystemTime(new Date(baseTime + notificationTime * MINUTE_MS));

  const mockEvents: Event[] = [
    {
      id: '1',
      title: '알림 테스트 이벤트',
      date: formatDate(new Date()),
      startTime: parseHM(baseTime + 10 * MINUTE_MS),
      endTime: parseHM(baseTime + 70 * MINUTE_MS),
      description: '이벤트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime,
    },
  ];

  const { result } = renderHook(() => useNotifications(mockEvents));

  await act(async () => vi.advanceTimersByTime(1000));
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toContain('1');

  await act(async () => vi.advanceTimersByTime(1000));
  expect(result.current.notifications).toHaveLength(1);

  vi.useRealTimers();
});
