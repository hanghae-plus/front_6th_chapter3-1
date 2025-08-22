import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

const events = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-10-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2025-10-02',
    startTime: '14:00',
    endTime: '15:00',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
] as Event[];

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifiedEvents).toHaveLength(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const now = new Date('2025-10-01T13:50:00'); // 이벤트 시작 10분 전
  vi.setSystemTime(now);

  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toEqual([
    { id: '1', message: '10분 후 이벤트 1 일정이 시작됩니다.' },
  ]);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const now = new Date('2025-10-01T13:50:00'); // 이벤트 시작 10분 전
  vi.setSystemTime(now);

  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  // 이벤트1의 알림 발생 시점(2025-10-01T13:50:00)으로 시간 설정
  const now = new Date('2025-10-01T13:50:00');
  vi.setSystemTime(now);

  const { result } = renderHook(() => useNotifications(events));

  // 첫 번째 알림 발생
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  // 타이머를 여러 번 더 진행해도 중복 알림이 추가되지 않아야 함
  act(() => {
    vi.advanceTimersByTime(1000 * 60 * 10);
  });

  expect(result.current.notifications).toHaveLength(1);
});
