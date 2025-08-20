import { act, renderHook, waitFor } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

const skipTimer = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

const createTestEvent = (overrides: Partial<Event> = {}): Event => ({
  id: '1',
  title: '테스트 이벤트',
  date: '2025-10-01',
  startTime: '01:00',
  endTime: '23:59',
  notificationTime: 60,
  category: '테스트',
  description: '테스트 이벤트 설명',
  location: '테스트 위치',
  repeat: { type: 'none', interval: 0 },
  ...overrides,
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([createTestEvent()]));
  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const { result } = renderHook(() => useNotifications([createTestEvent()]));
  skipTimer(1000);
  expect(result.current.notifications).toEqual([
    { id: '1', message: '60분 후 테스트 이벤트 일정이 시작됩니다.' },
  ]);
  expect(result.current.notifiedEvents).toEqual(['1']);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications([createTestEvent()]));
  skipTimer(1000);
  act(() => {
    result.current.removeNotification(0);
  });
  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual(['1']);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const { result } = renderHook(() => useNotifications([createTestEvent()]));

  skipTimer(1000);
  expect(result.current.notifications).toEqual([
    { id: '1', message: '60분 후 테스트 이벤트 일정이 시작됩니다.' },
  ]);
  expect(result.current.notifiedEvents).toEqual(['1']);

  skipTimer(1000);
  expect(result.current.notifications).toEqual([
    { id: '1', message: '60분 후 테스트 이벤트 일정이 시작됩니다.' },
  ]);
  expect(result.current.notifiedEvents).toEqual(['1']);
});
