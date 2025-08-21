import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
// import { formatDate } from '../../utils/dateUtils.ts';
// import { parseHM } from '../utils.ts';
import { createEvent } from '../__fixture__/eventFactory.ts';
import { expect } from 'vitest';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const events: Event[] = [
    createEvent({
      id: '1',
      date: '2025-10-01',
      title: 'event 1',
      startTime: '09:00',
      endTime: '10:00',
    }),
  ];
  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const events: Event[] = [
    createEvent({
      id: '1',
      date: '2025-10-01',
      title: 'event 1',
      startTime: '00:10',
      notificationTime: 60,
    }),
  ];

  const { result } = renderHook(() => useNotifications(events));

  // 1초뒤 생성
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(result.current.notifications).toHaveLength(1);

  // 2차: 30분 경과 후에도 기존 알림 유지
  act(() => {
    vi.advanceTimersByTime(30 * 60 * 1000);
  });
  expect(result.current.notifications).toHaveLength(1); // 여전히 1개

  expect(result.current.notifiedEvents).toEqual(['1']);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const events: Event[] = [
    createEvent({
      id: '1',
      date: '2025-10-01',
      title: 'event 1',
      startTime: '01:00',
      notificationTime: 60,
    }),
    createEvent({
      id: '2',
      date: '2025-10-01',
      title: 'event 2',
      startTime: '01:00',
      notificationTime: 60,
    }),
  ];
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  act(() => {
    result.current.removeNotification(1);
  });

  expect(result.current.notifications).toEqual([
    {
      id: '1',
      message: '60분 후 event 1 일정이 시작됩니다.',
    },
  ]);
  expect(result.current.notifiedEvents).toEqual(['1', '2']);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.setSystemTime(new Date('2025-10-01T00:59:00')); // 1분 전
  const events: Event[] = [
    createEvent({
      id: '1',
      date: '2025-10-01',
      title: 'event 1',
      startTime: '01:00',
      notificationTime: 60,
    }),
  ];

  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000);
  });
  // 발생 이벤트 확인
  expect(result.current.notifiedEvents).toEqual(['1']);

  // 두번째 시도
  act(() => {
    vi.advanceTimersByTime(2000);
  });
  // 다시 확인
  expect(result.current.notifiedEvents).toEqual(['1']);
  // 세번째 시도
  act(() => {
    vi.advanceTimersByTime(3000);
  });
  expect(result.current.notifiedEvents).toEqual(['1']);
});
