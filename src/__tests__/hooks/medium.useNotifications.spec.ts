import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { createMockEvent } from '../utils.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const events = [createMockEvent(1), createMockEvent(2)];
  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('생성된 일정에 대해 알림 10분 전 알림이 생성된다', async () => {
  // 질문 사항 setUp쪽에서 시간이 흐르도록 설정했음에도 vi.advanceTimersByTimeAsync(1000)을 설정하지 않으면 실패하는 이유
  vi.setSystemTime(new Date('2025-10-15T08:49:59'));

  const events = [
    createMockEvent(1, {
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
    }),
    createMockEvent(2, {
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
    }),
  ];
  const { result } = renderHook(() => useNotifications(events));

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].message).toBe('10분 후 기존 회의 일정이 시작됩니다.');
});

it('두개의 알림 중 첫번째 알림을 제거하면 두번째 알림만 남는다', async () => {
  vi.setSystemTime(new Date('2025-10-15T08:49:59'));

  const events = [
    createMockEvent(1, {
      title: '아침 약속 1',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
    }),
    createMockEvent(2, {
      title: '기존 회의 2',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
    }),
  ];
  const { result } = renderHook(() => useNotifications(events));

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].message).toBe('10분 후 기존 회의 2 일정이 시작됩니다.');
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
  vi.setSystemTime(new Date('2025-10-15T08:49:59'));

  const events = [
    createMockEvent(1, {
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
    }),
  ];
  const { result } = renderHook(() => useNotifications(events));

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
});
