import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';

// 굳이 써야할 이유를 모르겠어서 주석처리
// import { parseHM } from '../utils.ts';

// msw는 기본적으로 이벤트가 존재하므로, Events 빈배열인 상태를 초기 상태로 가정
it('초기 상태에서는 알림이 없어야 한다', () => {
  const events: Event[] = [];
  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  // 가상의 시간을 현재 시간으로 설정
  const mockNow = new Date('2025-01-01T09:50:00');
  vi.useFakeTimers();
  vi.setSystemTime(mockNow);

  const events: Event[] = [
    {
      id: '1',
      title: '테스트 미팅',
      date: formatDate(mockNow),
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트',
      location: '테스트 장소',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toHaveLength(0);

  // notification을 트리거하기 위해 미래로 1초 보냄
  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0]).toEqual({
    id: '1',
    message: '10분 후 테스트 미팅 일정이 시작됩니다.',
  });

  vi.useRealTimers();
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications([]));

  // 이벤트 없이 알림 3개 수동으로 추가
  act(() => {
    result.current.setNotifications([
      { id: '1', message: '첫 번째 알림' },
      { id: '2', message: '두 번째 알림' },
      { id: '3', message: '세 번째 알림' },
    ]);
  });

  expect(result.current.notifications).toHaveLength(3);

  // index 1 (두 번째 알림) 제거
  act(() => {
    result.current.removeNotification(1);
  });

  // 두 번째 알림이 제거되고 2개 남음
  expect(result.current.notifications).toHaveLength(2);
  expect(result.current.notifications[0]).toEqual({ id: '1', message: '첫 번째 알림' });
  expect(result.current.notifications[1]).toEqual({ id: '3', message: '세 번째 알림' });
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
  const mockNow = new Date('2025-01-01T09:50:00');
  vi.useFakeTimers();
  vi.setSystemTime(mockNow);

  const events: Event[] = [
    {
      id: '1',
      title: '테스트 미팅',
      date: formatDate(mockNow),
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트',
      location: '테스트 장소',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const { result } = renderHook(() => useNotifications(events));

  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toEqual(['1']);

  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toEqual(['1']);

  vi.useRealTimers();
});
