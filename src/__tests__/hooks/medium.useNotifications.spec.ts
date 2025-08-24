import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { 분 } from '../../utils/notificationUtils.ts';
import { parseHM } from '../utils.ts';

describe('초기 상태', () => {
  test('빈 이벤트 배열로 초기화하면 알림이 없어야 한다', () => {
    // Given & When: 빈 이벤트 배열로 useNotifications 훅을 초기화하면
    const { result } = renderHook(() => useNotifications([]));

    // Then: 초기 상태에서 알림과 알림된 이벤트가 모두 비어있어야 한다
    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });
});

describe('알림 생성', () => {
  test('지정된 알림 시간이 되면 새로운 알림이 생성되어야 한다', () => {
    // Given: 10분 후 시작하는 이벤트와 5분 전 알림 설정
    const notificationTime = 5;
    const eventStartTime = Date.now() + 10 * 분;
    const events: Event[] = [
      {
        id: '1',
        title: '테스트 이벤트',
        date: formatDate(new Date()),
        startTime: parseHM(eventStartTime),
        endTime: parseHM(eventStartTime + 10 * 분),
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime,
      },
    ];

    const { result } = renderHook(() => useNotifications(events));

    // Then: 초기에는 알림이 없어야 한다
    expect(result.current.notifications).toHaveLength(0);

    // When: 알림 시간(이벤트 시작 5분 전)으로 시스템 시간을 설정하고 타이머를 진행하면
    vi.setSystemTime(new Date(eventStartTime - notificationTime * 분));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Then: 알림이 생성되고 해당 이벤트가 알림된 목록에 추가되어야 한다
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].message).toContain('테스트 이벤트');
    expect(result.current.notifiedEvents).toContain('1');
  });
});

describe('중복 알림 방지', () => {
  test('이미 알림이 발생한 이벤트는 중복 알림이 생성되지 않아야 한다', () => {
    // Given: 알림 시간이 10분 전인 이벤트 설정
    const notificationTime = 10;
    const eventStartTime = Date.now() + 20 * 분;
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '테스트 이벤트',
        date: formatDate(new Date()),
        startTime: parseHM(eventStartTime),
        endTime: parseHM(eventStartTime + 10 * 분),
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime,
      },
    ];

    const { result } = renderHook(() => useNotifications(mockEvents));

    // When: 첫 번째 알림 시간으로 이동하고 타이머를 진행하면
    vi.setSystemTime(new Date(eventStartTime - notificationTime * 분));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Then: 알림이 생성되어야 한다
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain('1');

    // When: 동일한 시간에 다시 타이머를 진행하면
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Then: 중복 알림이 생성되지 않고 알림 개수가 유지되어야 한다
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain('1');
  });
});

describe('알림 제거', () => {
  test('removeNotification 호출 시 해당 인덱스의 알림이 제거되어야 한다', () => {
    // Given: 두 개의 알림이 수동으로 설정된 상태
    const { result } = renderHook(() => useNotifications([]));

    act(() => {
      result.current.setNotifications([
        {
          id: '1',
          message: '첫 번째 알림',
        },
        {
          id: '2',
          message: '두 번째 알림',
        },
      ]);
    });

    // Then: 두 개의 알림이 있어야 한다
    expect(result.current.notifications).toHaveLength(2);

    // When: 첫 번째 알림(인덱스 0)을 제거하면
    act(() => {
      result.current.removeNotification(0);
    });

    // Then: 알림이 1개로 줄어들고 두 번째 알림만 남아있어야 한다
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].message).toBe('두 번째 알림');
  });
});
