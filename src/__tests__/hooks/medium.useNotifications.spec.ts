import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';
import { 분 } from '../../utils/notificationUtils.ts';

test('초기 상태에서는 알림이 없어야 한다', () => {
  // Given: 빈 이벤트 배열로 useNotifications 훅을 초기화
  const { result } = renderHook(() => useNotifications([]));

  // Then: 초기 상태에서 알림과 알림된 이벤트가 모두 비어있어야 함
  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

test('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  // Given: 알림 시간이 5분 전인 이벤트와 useNotifications 훅을 설정
  const notificationTime = 5;
  const events: Event[] = [
    {
      id: '1',
      title: '테스트',
      date: formatDate(new Date()),
      startTime: parseHM(Date.now() + 10 * 분),
      endTime: parseHM(Date.now() + 20 * 분),
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime,
    },
  ];

  const { result } = renderHook(() => useNotifications(events));

  // Then: 초기 상태에서는 알림이 없어야 함
  expect(result.current.notifications).toHaveLength(0);

  // When: 알림 시간(5분 전)으로 시스템 시간을 설정하고 1초 후 알림 체크
  vi.setSystemTime(new Date(Date.now() + notificationTime * 분));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  // Then: 알림이 생성되고 알림된 이벤트 목록에 추가되어야 함
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toContain('1');
});

test('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  // Given: useNotifications 훅을 초기화하고 두 개의 알림을 수동으로 설정
  const { result } = renderHook(() => useNotifications([]));

  act(() => {
    result.current.setNotifications([
      {
        id: '1',
        message: '알림 1',
      },
      {
        id: '2',
        message: '알림 2',
      },
    ]);
  });

  // Then: 초기 상태에서 알림이 2개 있어야 함
  expect(result.current.notifications).toHaveLength(2);

  // When: 첫 번째 알림(index 0)을 제거
  act(() => {
    result.current.removeNotification(0);
  });

  // Then: 알림이 1개로 줄어들고 두 번째 알림이 남아있어야 함
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].message).toBe('알림 2');
});

test('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  // Given: 알림 시간이 10분 전인 이벤트와 useNotifications 훅을 설정
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

  // When: 첫 번째 알림 시간(시작 시간 - 알림 시간)으로 이동하고 1초 후 알림 체크
  vi.setSystemTime(new Date(eventStartTime - notificationTime * 분));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  // Then: 첫 번째 알림이 생성되고 알림된 이벤트 목록에 추가되어야 함
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toContain('1');

  // When: 다시 같은 알림 시간으로 이동하고 1초 후 알림 체크
  vi.setSystemTime(new Date(eventStartTime - notificationTime * 분));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  // Then: 중복 알림이 생성되지 않고 알림 개수가 그대로 유지되어야 함
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toContain('1');
});
