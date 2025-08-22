import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

// 테스트용 이벤트 데이터
const createTestEvent = (overrides: Partial<Event> = {}): Event => ({
  id: '1',
  title: '테스트 이벤트',
  date: '2024-01-01',
  startTime: '10:00',
  endTime: '11:00',
  description: '테스트 설명',
  location: '테스트 장소',
  category: '테스트',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 30, // 30분 전 알림
  ...overrides,
});

// 현재 시간을 모킹하는 헬퍼 함수 (setupTests.ts에서 이미 vi.useFakeTimers()가 설정됨)
const mockCurrentTime = (date: Date) => {
  vi.setSystemTime(date);
};

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const now = new Date('2024-01-01T09:30:00');
  mockCurrentTime(now);

  const event = createTestEvent({
    id: '1',
    date: '2024-01-01',
    startTime: '10:00',
    notificationTime: 30,
  });

  const { result } = renderHook(() => useNotifications([event]));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].id).toBe('1');
  expect(result.current.notifications[0].message).toBe('30분 후 테스트 이벤트 일정이 시작됩니다.');

  expect(result.current.notifiedEvents).toContain('1');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const now = new Date('2024-01-01T09:30:00');
  mockCurrentTime(now);

  const event1 = createTestEvent({
    id: '1',
    date: '2024-01-01',
    startTime: '10:00',
    notificationTime: 30,
  });

  const event2 = createTestEvent({
    id: '2',
    date: '2024-01-01',
    startTime: '10:00',
    notificationTime: 30,
  });

  const { result } = renderHook(() => useNotifications([event1, event2]));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(2);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].id).toBe('2');
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const now = new Date('2024-01-01T09:30:00');
  mockCurrentTime(now);

  const event = createTestEvent({
    id: '1',
    date: '2024-01-01',
    startTime: '10:00',
    notificationTime: 30,
  });

  const { result } = renderHook(() => useNotifications([event]));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toContain('1');

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toHaveLength(1);
});

it('알림 시간이 되지 않은 이벤트는 알림이 생성되지 않아야 한다', () => {
  const now = new Date('2024-01-01T09:00:00'); // 9:00
  mockCurrentTime(now);

  const event = createTestEvent({
    id: '1',
    date: '2024-01-01',
    startTime: '10:00',
    notificationTime: 30,
  });

  const { result } = renderHook(() => useNotifications([event]));

  // 1초 후 알림 체크
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  // 아직 알림 시간이 되지 않았으므로 알림이 생성되지 않아야 함
  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifiedEvents).toHaveLength(0);
});

// 추가 테스트: 여러 이벤트가 동시에 알림 시간에 도달하는 경우
it('여러 이벤트가 동시에 알림 시간에 도달하는 경우 모든 알림이 생성되어야 한다', () => {
  const now = new Date('2024-01-01T09:30:00');
  mockCurrentTime(now);

  const event1 = createTestEvent({
    id: '1',
    date: '2024-01-01',
    startTime: '10:00',
    notificationTime: 30,
  });

  const event2 = createTestEvent({
    id: '2',
    date: '2024-01-01',
    startTime: '10:00', // 10:00으로 변경하여 동시에 알림 시간에 도달
    notificationTime: 30,
  });

  const { result } = renderHook(() => useNotifications([event1, event2]));

  // 1초 후 알림 체크
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  // 두 개의 알림이 모두 생성되어야 함
  expect(result.current.notifications).toHaveLength(2);
  expect(result.current.notifiedEvents).toHaveLength(2);

  // 알림 메시지 확인
  const notificationIds = result.current.notifications.map((n) => n.id);
  expect(notificationIds).toContain('1');
  expect(notificationIds).toContain('2');
});
