import { act, renderHook, waitFor } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '신규 세미나',
      date: '2025-07-10',
      startTime: '11:00',
      endTime: '12:00',
      description: '신규 프로젝트 세미나',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '점심 약속',
      date: '2025-07-22',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심 약속',
      location: '식당 C',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  vi.setSystemTime(new Date('2025-07-01T08:50:00Z')); // 알림 10분 전
  const events: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  vi.useFakeTimers();
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000); // 1초 경과
  });
  await waitFor(() => {
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].message).toBe('10분 후 기존 회의 일정이 시작됩니다.');
  });
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
  vi.setSystemTime(new Date('2025-07-01T08:50:00Z')); // 알림 10분 전
  const events: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  vi.useFakeTimers();
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000); // 1초 경과
  });

  act(() => {
    result.current.removeNotification(0);
  });
  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifiedEvents).toEqual(['1']);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
  vi.setSystemTime(new Date('2025-07-01T08:50:00Z')); // 알림 10분 전
  const events: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  vi.useFakeTimers();
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000); // 1초 경과
  });
  await waitFor(() => {
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].message).toBe('10분 후 기존 회의 일정이 시작됩니다.');
  });

  act(() => {
    vi.advanceTimersByTime(1000); // 1초 경과
  });

  await waitFor(() => {
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toEqual(['1']);
  });
});
