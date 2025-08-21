import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const mockEvents: Event[] = [
    {
      id: '3e8f2c4a-9b1d-4e2f-8c5a-1f4e8c2d9b7a',
      title: '기획 회의',
      date: '2025-10-01',
      startTime: '00:01',
      endTime: '01:00',
      description: '월간 기획 회의 및 로드맵 논의',
      location: '대회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];
  const { result } = renderHook(() => useNotifications(mockEvents));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifications.length).toBe(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const mockEvents: Event[] = [
    {
      id: '3e8f2c4a-9b1d-4e2f-8c5a-1f4e8c2d9b7a',
      title: '기획 회의',
      date: '2025-10-01',
      startTime: '00:01',
      endTime: '01:00',
      description: '월간 기획 회의 및 로드맵 논의',
      location: '대회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];
  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0]).toEqual({
    id: mockEvents[0].id,
    message: '1분 후 기획 회의 일정이 시작됩니다.',
  });
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const mockEvents: Event[] = [
    {
      id: '3e8f2c4a-9b1d-4e2f-8c5a-1f4e8c2d9b7a',
      title: '기획 회의',
      date: '2025-10-01',
      startTime: '00:01',
      endTime: '01:00',
      description: '월간 기획 회의 및 로드맵 논의',
      location: '대회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: 'a7c3f8e2-6d4b-4a9e-b2c8-5f1a3e7d9c6b',
      title: '클라이언트 미팅',
      date: '2025-10-01',
      startTime: '00:02',
      endTime: '01:00',
      description: '신규 프로젝트 요구사항 정리',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 2,
    },
  ];
  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  // 알림 이벤트 2개 체크
  expect(result.current.notifications).toHaveLength(2);

  act(() => {
    result.current.removeNotification(0);
  });

  // 첫 번째 알림 이벤트 제거 여부 체크
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0]).toEqual({
    id: 'a7c3f8e2-6d4b-4a9e-b2c8-5f1a3e7d9c6b',
    message: '2분 후 클라이언트 미팅 일정이 시작됩니다.',
  });
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const mockEvents: Event[] = [
    {
      id: '3e8f2c4a-9b1d-4e2f-8c5a-1f4e8c2d9b7a',
      title: '기획 회의',
      date: '2025-10-01',
      startTime: '00:01',
      endTime: '01:00',
      description: '월간 기획 회의 및 로드맵 논의',
      location: '대회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];
  const { result } = renderHook(() => useNotifications(mockEvents));

  // 첫 번째 알림 발생
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toEqual(['3e8f2c4a-9b1d-4e2f-8c5a-1f4e8c2d9b7a']);

  // 추가 시간이 흘러도 중복 알림이 발생하지 않아야 함
  act(() => {
    vi.advanceTimersByTime(2000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toEqual(['3e8f2c4a-9b1d-4e2f-8c5a-1f4e8c2d9b7a']);
});
