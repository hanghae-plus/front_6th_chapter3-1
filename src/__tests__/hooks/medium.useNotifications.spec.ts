import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { createEvent } from '../utils.ts';
// import { Event } from '../../types.ts';
// import { formatDate } from '../../utils/dateUtils.ts';
// import { parseHM } from '../utils.ts';

const events = [
  createEvent({ date: '2025-09-01', startTime: '09:00', notificationTime: 1 }),
  createEvent({ date: '2025-09-01', startTime: '10:00', notificationTime: 5 }),
];

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-09-01 08:58:00'));
});

afterEach(() => {
  vi.clearAllTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const { result } = renderHook(() => useNotifications(events));
  act(() => {
    vi.advanceTimersByTime(60 * 1000);
  });

  expect(result.current.notifications[0].id).toEqual('1');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications([]));
  act(() => {
    result.current.setNotifications([
      { id: '1', message: '테스트' },
      { id: '2', message: '테스트' },
    ]);
  });

  expect(result.current.notifications.length).toEqual(2);
  expect(result.current.notifications[0].id).toEqual('1');
  expect(result.current.notifications[1].id).toEqual('2');

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications.length).toEqual(1);
  expect(result.current.notifications[0].id).toEqual('2');
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));
  act(() => {
    vi.advanceTimersByTime(60 * 1000);
  });

  expect(result.current.notifications.length).toEqual(1);
  expect(result.current.notifications[0].id).toEqual('1');

  const expected = result.current.notifications[0];
  act(() => {
    vi.advanceTimersByTime(30 * 1000);
  });

  expect(result.current.notifications.length).toEqual(1);
  expect(result.current.notifications[0]).toEqual(expected);
});
