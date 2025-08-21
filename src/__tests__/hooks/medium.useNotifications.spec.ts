import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { createEvents } from '../eventFactory.ts';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
});

// fixme: 초기 상태에도 조건이 맞으면 알림이 생성되어야 하지 않을까?
it('초기 상태에서는 알림이 없어야 한다', () => {
  vi.setSystemTime(new Date('2025-09-01 08:58:00'));

  const events = createEvents([
    { date: '2025-09-01', startTime: '09:00', notificationTime: 1 },
    { date: '2025-09-01', startTime: '10:00', notificationTime: 5 },
  ]);

  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.setSystemTime(new Date('2025-09-01 08:58:00'));

  const events = createEvents([
    { id: '1', date: '2025-09-01', startTime: '09:00', notificationTime: 1 },
    { id: '2', date: '2025-09-01', startTime: '10:00', notificationTime: 5 },
  ]);

  const { result } = renderHook(() => useNotifications(events));

  // 1분 앞당기기 -> 08:59 -> 1번 이벤트 알림 발생
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
  vi.setSystemTime(new Date('2025-09-01 08:58:00'));

  const events = createEvents([
    { id: '1', date: '2025-09-01', startTime: '09:00', notificationTime: 1 },
    { id: '2', date: '2025-09-01', startTime: '10:00', notificationTime: 5 },
  ]);

  const { result } = renderHook(() => useNotifications(events));

  // 1분 앞당기기 -> 08:59 -> 1번 이벤트 알림 발생
  act(() => {
    vi.advanceTimersByTime(60 * 1000);
  });

  expect(result.current.notifications.length).toEqual(1);
  expect(result.current.notifications[0].id).toEqual('1');

  const expected = result.current.notifications[0];

  // 30초 더 앞당기기
  act(() => {
    vi.advanceTimersByTime(30 * 1000);
  });

  // 여전히 1번 알림만 존재
  expect(result.current.notifications.length).toEqual(1);
  expect(result.current.notifications[0]).toEqual(expected);
});
