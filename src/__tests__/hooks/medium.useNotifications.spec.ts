import { act, renderHook } from '@testing-library/react';
import { expect } from 'vitest';

import { defaultMockEvents } from '../../__mocks__/mockData.ts';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

it('이벤트 데이터가 빈 배열일 때 알림 배열과 알람된 이벤트 배열이 비어있어야 한다.', () => {
  const events: Event[] = [];

  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-08-21T09:55:00'));

  const events: Event[] = defaultMockEvents;

  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0]).toEqual({
    id: '1',
    message: '10분 후 모각코 일정이 시작됩니다.',
  });

  expect(result.current.notifiedEvents).toEqual(['1']);

  vi.useRealTimers();
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-08-21T09:55:00'));

  const events: Event[] = defaultMockEvents;

  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifications).toEqual([]);

  vi.useRealTimers();
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-08-21T09:55:00'));

  const events: Event[] = defaultMockEvents;

  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toEqual(['1']);

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toEqual(['1']);

  vi.useRealTimers();
});
