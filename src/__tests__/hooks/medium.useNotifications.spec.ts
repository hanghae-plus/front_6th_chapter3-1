import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const newEvent: Event = {
    id: '1',
    title: '기존 회의',
    date: '2025-10-01',
    startTime: '01:00',
    endTime: '02:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  };

  const { result } = renderHook(() => useNotifications([newEvent]));

  // 알림 생성 전 알림배열 비어있는지 확인
  expect(result.current.notifications).toHaveLength(0);

  // 시간을 30분 진행
  act(() => {
    vi.advanceTimersByTime(30 * 60 * 1000);
  });

  expect(result.current.notifications).toHaveLength(1);
});

// AS IS : index를 기준으로 알림을 적절하게 제거할 수 있다.
// 어떤 인덱스인지 정확하게 명시해줄 필요가 있어보임
// TO BE : notification events의 index를 기준으로 알림을 적절하게 제거할 수 있다.
it('notification events의 index를 기준으로 알림을 적절하게 제거할 수 있다.', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '기존 회의 - 1',
      date: '2025-10-01',
      startTime: '01:00',
      endTime: '02:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    },
    {
      id: '2',
      title: '기존 회의 - 2',
      date: '2025-10-01',
      startTime: '01:00',
      endTime: '04:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    },
  ];

  const { result } = renderHook(() => useNotifications(events));
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  // 알림이 2개 생성되었는지 확인
  expect(result.current.notifications).toHaveLength(2);

  // 두 번째 알림 제거
  act(() => {
    result.current.removeNotification(1);
  });

  // 첫 번째 알림만 남았는지 확인
  expect(result.current.notifications).toEqual([
    { id: '1', message: '60분 후 기존 회의 - 1 일정이 시작됩니다.' },
  ]);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const newEvent: Event = {
    id: '1',
    title: '기존 회의',
    date: '2025-10-01',
    startTime: '01:00',
    endTime: '02:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  };

  const { result } = renderHook(() => useNotifications([newEvent]));

  // 30분 지나서 알림 하나 생성
  act(() => {
    vi.advanceTimersByTime(30 * 60 * 1000);
  });

  // 알림 한 개 생성 되었는지 확인
  expect(result.current.notifications).toEqual([
    {
      id: '1',
      message: '30분 후 기존 회의 일정이 시작됩니다.',
    },
  ]);

  // 2초 지남
  act(() => {
    vi.advanceTimersByTime(2000);
  });

  // 알림이 더 생성되지 않았는지 확인
  expect(result.current.notifications).toHaveLength(1);
});
