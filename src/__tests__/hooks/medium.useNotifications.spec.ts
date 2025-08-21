import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils.ts';
import { parseHM } from '../utils.ts';

// 유틸리티 함수들을 모킹합니다.
vi.mock('../../utils/notificationUtils', () => ({
  getUpcomingEvents: vi.fn(),
  createNotificationMessage: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  // 각 테스트 전에 타이머 정리
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const mockEvents: Event[] = [];

  const { result } = renderHook(() => useNotifications(mockEvents));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.useFakeTimers();

  try {
    const mockEvent: Event = {
      id: '1',
      title: '미팅',
      date: '2025-08-20',
      startTime: '10:30',
      endTime: '11:00',
      category: 'work',
      description: '',
      location: '',
      notificationTime: 5,
      repeat: { interval: 0, type: 'none' },
    };

    const mockedGetUpcomingEvents = vi.mocked(getUpcomingEvents);
    const mockedCreateNotificationMessage = vi.mocked(createNotificationMessage);

    mockedGetUpcomingEvents.mockReturnValueOnce([mockEvent]);
    mockedCreateNotificationMessage.mockReturnValueOnce('미팅 알림');

    const { result } = renderHook(() => useNotifications([]));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toEqual([
      {
        id: '1',
        message: '미팅 알림',
      },
    ]);

    expect(result.current.notifiedEvents).toEqual(['1']);
  } finally {
    vi.useRealTimers();
  }
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  vi.useFakeTimers();

  try {
    const mockEvent1: Event = {
      id: '1',
      title: '미팅',
      date: '2025-08-20',
      startTime: '10:30',
      endTime: '11:00',
      category: 'work',
      description: '',
      location: '',
      notificationTime: 5,
      repeat: { interval: 0, type: 'none' },
    };

    const mockEvent2: Event = {
      id: '2',
      title: '점심',
      date: '2025-08-20',
      startTime: '12:00',
      endTime: '13:00',
      category: 'personal',
      description: '',
      location: '',
      notificationTime: 5,
      repeat: { interval: 0, type: 'none' },
    };

    const mockedGetUpcomingEvents = vi.mocked(getUpcomingEvents);
    const mockedCreateNotificationMessage = vi.mocked(createNotificationMessage);

    mockedGetUpcomingEvents.mockReturnValueOnce([mockEvent1, mockEvent2]);
    mockedCreateNotificationMessage.mockReturnValueOnce('미팅 알림');
    mockedCreateNotificationMessage.mockReturnValueOnce('점심 알림');

    const { result } = renderHook(() => useNotifications([]));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(2);

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe('2');

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toHaveLength(0);
  } finally {
    vi.useRealTimers();
  }
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.useFakeTimers();

  try {
    const mockEvent: Event = {
      id: '1',
      title: '미팅',
      date: '2025-08-20',
      startTime: '10:30',
      endTime: '11:00',
      category: 'work',
      description: '',
      location: '',
      notificationTime: 5,
      repeat: { interval: 0, type: 'none' },
    };

    const mockedGetUpcomingEvents = vi.mocked(getUpcomingEvents);
    const mockedCreateNotificationMessage = vi.mocked(createNotificationMessage);

    mockedGetUpcomingEvents.mockReturnValueOnce([mockEvent]);
    mockedGetUpcomingEvents.mockReturnValueOnce([]);
    mockedGetUpcomingEvents.mockReturnValueOnce([]);

    mockedCreateNotificationMessage.mockReturnValueOnce('미팅 알림');

    const { result } = renderHook(() => useNotifications([]));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain('1');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toHaveLength(1);
  } finally {
    vi.useRealTimers();
  }
});

it('여러 이벤트가 동시에 알림 시간에 도달하면 모든 알림이 생성된다', () => {
  vi.useFakeTimers();

  try {
    const mockEvent1: Event = {
      id: '1',
      title: '팀 회의',
      date: '2025-08-20',
      startTime: '10:30',
      endTime: '11:00',
      category: 'work',
      description: '',
      location: '',
      notificationTime: 5,
      repeat: { interval: 0, type: 'none' },
    };

    const mockEvent2: Event = {
      id: '2',
      title: '점심 식사',
      date: '2025-08-20',
      startTime: '10:31',
      endTime: '11:01',
      category: 'personal',
      description: '',
      location: '',
      notificationTime: 5,
      repeat: { interval: 0, type: 'none' },
    };

    const mockEvent3: Event = {
      id: '3',
      title: '고객 미팅',
      date: '2025-08-20',
      startTime: '10:32',
      endTime: '11:02',
      category: 'work',
      description: '',
      location: '',
      notificationTime: 5,
      repeat: { interval: 0, type: 'none' },
    };

    const mockedGetUpcomingEvents = vi.mocked(getUpcomingEvents);
    const mockedCreateNotificationMessage = vi.mocked(createNotificationMessage);

    mockedGetUpcomingEvents.mockReturnValueOnce([mockEvent1, mockEvent2, mockEvent3]);
    mockedCreateNotificationMessage.mockReturnValueOnce('팀 회의 알림');
    mockedCreateNotificationMessage.mockReturnValueOnce('점심 식사 알림');
    mockedCreateNotificationMessage.mockReturnValueOnce('고객 미팅 알림');

    const { result } = renderHook(() => useNotifications([]));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // 모든 알림이 올바르게 생성되었는지 확인
    expect(result.current.notifications).toEqual([
      {
        id: '1',
        message: '팀 회의 알림',
      },
      {
        id: '2',
        message: '점심 식사 알림',
      },
      {
        id: '3',
        message: '고객 미팅 알림',
      },
    ]);

    expect(result.current.notifiedEvents).toHaveLength(3);
    expect(result.current.notifiedEvents).toContain('1');
    expect(result.current.notifiedEvents).toContain('2');
    expect(result.current.notifiedEvents).toContain('3');
  } finally {
    vi.useRealTimers();
  }
});

it('알림 시간이 지난 이벤트는 알림이 생성되지 않는다', () => {
  vi.useFakeTimers();

  try {
    const mockedGetUpcomingEvents = vi.mocked(getUpcomingEvents);

    mockedGetUpcomingEvents.mockReturnValueOnce([]);

    const { result } = renderHook(() => useNotifications([]));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(0);
  } finally {
    vi.useRealTimers();
  }
});

it('알림 시간이 아직 도달하지 않은 이벤트는 알림이 생성되지 않는다', () => {
  vi.useFakeTimers();

  try {
    const mockedGetUpcomingEvents = vi.mocked(getUpcomingEvents);

    mockedGetUpcomingEvents.mockReturnValueOnce([]);

    const { result } = renderHook(() => useNotifications([]));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.notifiedEvents).toHaveLength(0);
  } finally {
    vi.useRealTimers();
  }
});
