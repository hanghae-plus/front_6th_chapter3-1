import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

const events = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-10-01',
    startTime: '00:20',
    endTime: '07:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
] as Event[];

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

const skipTime = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const { result } = renderHook(() => useNotifications(events));
  skipTime(1000 * 60 * 10);

  expect(result.current.notifications).toEqual([
    { id: '1', message: '10분 후 팀 회의 일정이 시작됩니다.' },
  ]);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications(events));
  skipTime(1000 * 60 * 10);
  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toEqual([]);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));
  skipTime(1000 * 60 * 10);
  expect(result.current.notifications).toEqual([
    { id: '1', message: '10분 후 팀 회의 일정이 시작됩니다.' },
  ]);
  expect(result.current.notifiedEvents).toEqual(['1']);
});
