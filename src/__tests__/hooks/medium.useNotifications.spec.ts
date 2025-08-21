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
  // 1. 시간 모킹
  vi.useFakeTimers();

  // 2. 시간 설정: 8시 59분
  vi.setSystemTime(new Date('2025-07-01T08:59:00'));

  // 3. 이벤트 데이터 (9시 시작, 1분 전 알림)
  const events = [
    {
      id: '1',
      title: '회의',
      date: formatDate(new Date('2025-07-01')),
      startTime: parseHM(new Date('2025-07-01T09:00:00').getTime()),
      notificationTime: 1,
    },
  ] as Event[];

  // 4. 훅 렌더링
  const { result } = renderHook(() => useNotifications(events));

  // 5. 초기 상태 확인
  expect(result.current.notifications).toEqual([]);

  // 6. 1초 진행 (setInterval 실행)
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  // 7. 알림 생성 확인
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].message).toBe('1분 후 회의 일정이 시작됩니다.');

  // 8. 정리
  vi.useRealTimers();
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications([]));

  act(() => {
    result.current.setNotifications([
      { id: '1', message: '첫 번째 알림' },
      { id: '2', message: '두 번째 알림' },
      { id: '3', message: '세 번째 알림' },
    ]);
  });

  expect(result.current.notifications).toHaveLength(3);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(2);
  expect(result.current.notifications[0].message).toBe('두 번째 알림');
  expect(result.current.notifications[1].message).toBe('세 번째 알림');
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  // 1. 시간 모킹
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-07-01T08:59:00'));

  // 2. 알림 대상 이벤트 준비
  const events = [
    {
      id: 'test-event',
      title: '회의',
      date: formatDate(new Date('2025-07-01')),
      startTime: parseHM(new Date('2025-07-01T09:00:00').getTime()),
      notificationTime: 1,
    },
  ] as Event[];

  // 3. 훅 렌더링
  const { result } = renderHook(() => useNotifications(events));

  // 4. 초기 상태 확인
  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifiedEvents).toHaveLength(0);

  // 5. 첫 번째 setInterval 실행 → 알림 생성
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  // 6. 첫 번째 알림 확인
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toEqual(['test-event']);

  // 7. 두 번째 setInterval 실행 → 중복 알림 방지
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  // 8. 중복 알림이 생성되지 않았는지 확인
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toHaveLength(1);

  // 9. 정리
  vi.useRealTimers();
});
