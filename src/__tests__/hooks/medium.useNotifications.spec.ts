import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';
import { createNotificationMessage } from '../../utils/notificationUtils.ts';

const events: Event[] = [
  {
    id: 'a6b7c8d9-1111-2222-3333-444455556666',
    title: '디자인 QA',
    date: '2025-08-01',
    startTime: '16:00',
    endTime: '17:00',
    description: '신규 장바구니 페이지 픽셀 퍼펙트 검수',
    location: 'Figma/Jira',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '11112222-3333-4444-5555-666677778888',
    title: '코드리뷰 타임',
    date: '2025-08-22',
    startTime: '11:00',
    endTime: '11:30',
    description: 'PR #124 ~ #129 리뷰',
    location: 'GitHub PR',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 5,
  },
  {
    id: '9999aaaa-bbbb-cccc-dddd-eeeeffff0001',
    title: 'PT 상담',
    date: '2025-08-23',
    startTime: '19:30',
    endTime: '20:00',
    description: '체형 분석 및 루틴 점검',
    location: '동네 헬스장',
    category: '건강',
    repeat: { type: 'weekly', interval: 2 },
    notificationTime: 30,
  },
];

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${events[0].date}T15:50:00`));

  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toEqual([
    { id: events[0].id, message: createNotificationMessage(events[0]) },
  ]);

  vi.useRealTimers();
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${events[0].date}T15:50:00`));

  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toEqual([
    { id: events[0].id, message: createNotificationMessage(events[0]) },
  ]);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toEqual([]);

  vi.useRealTimers();
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${events[0].date}T15:50:00`));

  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toEqual([
    { id: events[0].id, message: createNotificationMessage(events[0]) },
  ]);

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toEqual([
    { id: events[0].id, message: createNotificationMessage(events[0]) },
  ]);
  expect(result.current.notifications.length).toEqual(1);

  vi.useRealTimers();
});
