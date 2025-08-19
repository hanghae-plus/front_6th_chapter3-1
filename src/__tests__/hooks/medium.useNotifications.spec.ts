import { vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import realEvents from '../../__mocks__/response/realEvents.json';
// import { formatDate } from '../../utils/dateUtils.ts';
// import { parseHM } from '../utils.ts';

beforeEach(() => {
  vi.useRealTimers();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-08-20T09:58:55'));
});

afterEach(() => {
  vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const events = realEvents.events as Event[];
  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const events = realEvents.events as Event[];
  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toEqual([]);

  act(() => {
    vi.advanceTimersByTime(5000);
  });

  expect(result.current.notifications.length).toBe(1);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const events = realEvents.events as Event[];
  const { result } = renderHook(() => useNotifications(events));
  const notifications = [
    { id: '2b7545a6-ebee-426c-b906-2329bc8d62bd', message: '1분 후 팀 회의 일정이 시작됩니다.' },
    { id: '09702fb3-a478-40b3-905e-9ab3c8849dcd', message: '1분 후 점심 악속 일정이 시작됩니다.' },
  ];

  const expected = [
    { id: '09702fb3-a478-40b3-905e-9ab3c8849dcd', message: '1분 후 점심 악속 일정이 시작됩니다.' },
  ];

  act(() => {
    result.current.setNotifications(notifications);
  });

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toEqual(expected);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const events = realEvents.events as Event[];
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(5000);
  });

  expect(result.current.notifications.length).toBe(1);
  const curentNotification = result.current.notifications[0];

  act(() => {
    vi.advanceTimersByTime(5000);
  });

  expect(result.current.notifications.length).toBe(1);
  expect(result.current.notifications[0]).toEqual(curentNotification);
});
