import { act, renderHook } from '@testing-library/react';

import { createTestEvent } from '../../__mocks__/handlersUtils.ts';
import { useNotifications } from '../../hooks/useNotifications.ts';

describe('알림 초기 상태', () => {
  it('훅 초기화 시 알림 목록과 알림 완료 이벤트 목록이 비어있다', () => {
    // Given: 이벤트 목록이 주어진 상황
    const testEvents = [
      createTestEvent({
        id: '1',
        title: '팀 회의',
        date: '2025-12-25',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      }),
    ];

    // When: useNotifications 훅을 초기화할 때
    const { result } = renderHook(() => useNotifications(testEvents));

    // Then: 초기 상태는 빈 배열이어야 함
    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });
});

describe('알림 생성', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('이벤트 시작 시간이 알림 설정 시간에 도달하면 새 알림을 생성한다', async () => {
    // Given: 14:00에 시작하는 이벤트와 30분 전 알림 설정
    const testEvents = [
      createTestEvent({
        id: '1',
        title: '중요한 미팅',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '프로젝트 검토',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      }),
    ];

    // 현재 시간을 13:30으로 설정 (이벤트 시작 30분 전)
    vi.setSystemTime(new Date('2025-10-15T13:30:00'));

    // When: 훅을 초기화하고 interval이 실행될 때
    const { result } = renderHook(() => useNotifications(testEvents));

    // interval을 수동으로 진행
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Then: 알림이 생성되어야 함
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual({
      id: '1',
      message: '30분 후 중요한 미팅 일정이 시작됩니다.',
    });
    expect(result.current.notifiedEvents).toContain('1');
  });

  it('여러 이벤트가 동시에 알림 조건을 만족하면 모든 알림을 생성한다', async () => {
    // Given: 동시간대에 알림이 필요한 여러 이벤트
    const testEvents = [
      createTestEvent({
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15,
      }),
      createTestEvent({
        id: '2',
        title: '1:1 미팅',
        date: '2025-10-15',
        startTime: '14:10',
        endTime: '14:30',
        description: '개인 상담',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 20,
      }),
    ];

    // 현재 시간을 13:50으로 설정 (첫 번째 이벤트 10분 전, 두 번째 이벤트 20분 전)
    vi.setSystemTime(new Date('2025-10-15T13:50:00'));

    // When: 훅을 초기화하고 interval이 실행될 때
    const { result } = renderHook(() => useNotifications(testEvents));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Then: 두 개의 알림이 모두 생성되어야 함
    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications).toEqual([
      {
        id: '1',
        message: '15분 후 팀 회의 일정이 시작됩니다.',
      },
      {
        id: '2',
        message: '20분 후 1:1 미팅 일정이 시작됩니다.',
      },
    ]);
    expect(result.current.notifiedEvents).toEqual(['1', '2']);
  });

  it('알림 시간이 지나지 않은 이벤트는 알림을 생성하지 않는다', async () => {
    // Given: 알림 시간이 아직 도달하지 않은 이벤트
    const testEvents = [
      createTestEvent({
        id: '1',
        title: '미래 회의',
        date: '2025-10-15',
        startTime: '16:00',
        endTime: '17:00',
        description: '나중에 있는 회의',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      }),
    ];

    // 현재 시간을 15:00으로 설정 (이벤트 시작 60분 전, 알림 설정은 30분 전)
    vi.setSystemTime(new Date('2025-10-15T15:00:00'));

    // When: 훅을 초기화하고 interval이 실행될 때
    const { result } = renderHook(() => useNotifications(testEvents));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Then: 알림이 생성되지 않아야 함
    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });

  it('이미 시작된 이벤트는 알림을 생성하지 않는다', async () => {
    // Given: 이미 시작된 이벤트
    const testEvents = [
      createTestEvent({
        id: '1',
        title: '과거 회의',
        date: '2025-10-15',
        startTime: '13:00',
        endTime: '14:00',
        description: '이미 시작된 회의',
        location: '회의실 D',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      }),
    ];

    // 현재 시간을 13:30으로 설정 (이벤트 시작 후 30분 경과)
    vi.setSystemTime(new Date('2025-10-15T13:30:00'));

    // When: 훅을 초기화하고 interval이 실행될 때
    const { result } = renderHook(() => useNotifications(testEvents));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Then: 알림이 생성되지 않아야 함
    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });
});

describe('중복 알림 방지', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('이미 알림이 발생한 이벤트는 중복 알림을 생성하지 않는다', async () => {
    // Given: 알림 조건을 만족하는 이벤트
    const testEvents = [
      createTestEvent({
        id: '1',
        title: '테스트 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '중복 알림 테스트',
        location: '회의실 E',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      }),
    ];

    vi.setSystemTime(new Date('2025-10-15T13:30:00'));
    const { result } = renderHook(() => useNotifications(testEvents));

    // When: 첫 번째 interval이 실행되어 알림이 생성된 후
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    const initialNotificationCount = result.current.notifications.length;

    // 시간이 조금 더 지나도 (여전히 알림 조건 범위 내)
    vi.setSystemTime(new Date('2025-10-15T13:35:00'));

    // 두 번째 interval 실행
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Then: 중복 알림이 생성되지 않아야 함
    expect(result.current.notifications).toHaveLength(initialNotificationCount);
  });
});

describe('알림 제거', () => {
  it('지정된 인덱스의 알림을 올바르게 제거한다', async () => {
    // Given: 여러 개의 알림이 있는 상황
    const testEvents = [
      createTestEvent({
        id: '1',
        title: '첫 번째 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '첫 번째',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      }),
      createTestEvent({
        id: '2',
        title: '두 번째 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '두 번째',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      }),
    ];

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-10-15T13:30:00'));

    const { result } = renderHook(() => useNotifications(testEvents));

    // 알림이 생성될 때까지 대기
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(2);

    // When: 첫 번째 알림(인덱스 0)을 제거할 때
    act(() => {
      result.current.removeNotification(0);
    });

    // Then: 첫 번째 알림만 제거되고 두 번째 알림은 남아있어야 함
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual({
      id: '2',
      message: '30분 후 두 번째 회의 일정이 시작됩니다.',
    });

    vi.useRealTimers();
  });

  it('존재하지 않는 인덱스로 제거 시도해도 에러가 발생하지 않는다', () => {
    // Given: 빈 알림 목록
    const { result } = renderHook(() => useNotifications([]));

    // When: 존재하지 않는 인덱스로 제거를 시도할 때
    act(() => {
      result.current.removeNotification(999);
    });

    // Then: 에러 없이 빈 배열이 유지되어야 함
    expect(result.current.notifications).toEqual([]);
  });
});

describe('이벤트 목록 변경 대응', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-10-15T13:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('이벤트 목록이 변경되면 새로운 이벤트에 대한 알림을 체크한다', async () => {
    // Given: 초기 이벤트 목록
    const initialEvents = [
      createTestEvent({
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '기존 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      }),
    ];

    const { result, rerender } = renderHook(({ events }) => useNotifications(events), {
      initialProps: { events: initialEvents },
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);

    // When: 새 이벤트가 추가된 목록으로 업데이트할 때
    const updatedEvents = [
      ...initialEvents,
      createTestEvent({
        id: '2',
        title: '새로운 회의',
        date: '2025-10-15',
        startTime: '14:15',
        endTime: '15:15',
        description: '새로 추가된 회의',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 45,
      }),
    ];

    rerender({ events: updatedEvents });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Then: 새 이벤트에 대한 알림도 생성되어야 함
    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications.some((n) => n.id === '2')).toBe(true);
  });
});
