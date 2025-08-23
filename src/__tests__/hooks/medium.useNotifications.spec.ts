import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-10-01',
      startTime: '00:10',
      endTime: '01:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  expect(result.current.notifications[0]).toEqual({
    id: '1',
    message: '10분 후 테스트 이벤트 일정이 시작됩니다.',
  });
  expect(result.current.notifiedEvents).toEqual(['1']);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  // 여러 개의 알림이 발생할 수 있는 이벤트들 생성
  const events: Event[] = [
    {
      id: '1',
      title: '첫 번째 이벤트',
      date: '2025-10-01',
      startTime: '00:10',
      endTime: '01:00',
      description: '첫 번째 설명',
      location: '첫 번째 장소',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '두 번째 이벤트',
      date: '2025-10-01',
      startTime: '00:15',
      endTime: '01:00',
      description: '두 번째 설명',
      location: '두 번째 장소',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
  ];

  const { result } = renderHook(() => useNotifications(events));

  // 시간을 진행하여 알림들이 생성되도록 함
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  // 두 개의 알림이 생성되었는지 확인
  expect(result.current.notifications).toHaveLength(2);
  expect(result.current.notifications[0]).toEqual({
    id: '1',
    message: '10분 후 첫 번째 이벤트 일정이 시작됩니다.',
  });
  expect(result.current.notifications[1]).toEqual({
    id: '2',
    message: '15분 후 두 번째 이벤트 일정이 시작됩니다.',
  });

  // 첫 번째 알림(index 0) 제거
  act(() => {
    result.current.removeNotification(0);
  });

  // 첫 번째 알림이 제거되고 두 번째 알림만 남아있는지 확인
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0]).toEqual({
    id: '2',
    message: '15분 후 두 번째 이벤트 일정이 시작됩니다.',
  });

  // 남은 알림(index 0) 제거
  act(() => {
    result.current.removeNotification(0);
  });

  // 모든 알림이 제거되었는지 확인
  expect(result.current.notifications).toHaveLength(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-10-01',
      startTime: '00:10',
      endTime: '01:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  const { result } = renderHook(() => useNotifications(events));

  // 초기 상태 확인
  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);

  // 첫 번째 시간 진행으로 알림 생성
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  // 알림이 생성되고 notifiedEvents에 추가되었는지 확인
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0]).toEqual({
    id: '1',
    message: '10분 후 테스트 이벤트 일정이 시작됩니다.',
  });
  expect(result.current.notifiedEvents).toEqual(['1']);

  // 추가로 시간을 진행해도 중복 알림이 생성되지 않는지 확인
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  // 알림 개수가 여전히 1개이고 notifiedEvents도 변경되지 않았는지 확인
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toEqual(['1']);

  // 여러 번 더 시간을 진행해도 중복 알림이 생성되지 않는지 확인
  act(() => {
    vi.advanceTimersByTime(5000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toEqual(['1']);
});
