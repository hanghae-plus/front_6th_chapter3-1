import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

// 각 테스트 전후에 타이머 완전히 리셋
beforeEach(() => {
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([] as Event[]));
  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifications.length).toBe(0);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.useFakeTimers();
  const fixedNow = new Date('2025-08-20T09:55:00');
  vi.setSystemTime(fixedNow);

  const events: Event[] = [
    {
      id: '1',
      title: '회의',
      date: formatDate(fixedNow),
      startTime: parseHM(fixedNow.getTime() + 5 * 60 * 1000),
      notificationTime: 5,
    },
  ] as Event[];

  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications).toEqual([]);

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications.length).toBe(1);
  expect(result.current.notifications[0].message).toContain('5분');
  expect(result.current.notifications[0].id).toEqual('1');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  vi.useFakeTimers();
  const fixedNow = new Date('2025-08-20T10:00:00');
  vi.setSystemTime(fixedNow);

  const events: Event[] = [
    {
      id: '1',
      title: '테스트',
      date: formatDate(fixedNow),
      startTime: parseHM(fixedNow.getTime() + 5 * 60 * 1000),
      notificationTime: 5,
    },
  ] as Event[];

  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toEqual([]);

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications.length).toBe(1);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications.length).toEqual(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.useFakeTimers();
  const fixedNow = new Date('2025-08-20T11:00:00');
  vi.setSystemTime(fixedNow);

  const events: Event[] = [
    {
      id: '1',
      title: '중복 테스트',
      date: formatDate(fixedNow),
      startTime: parseHM(fixedNow.getTime() + 5 * 60 * 1000),
      notificationTime: 5,
    },
  ] as Event[];

  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toEqual([]);

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications.length).toBe(1);
  expect(result.current.notifiedEvents.length).toBe(1);

  act(() => {
    vi.advanceTimersByTime(2000);
  });

  expect(result.current.notifications.length).toBe(1);
  expect(result.current.notifiedEvents.length).toBe(1);
});
