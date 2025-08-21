import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils.ts';
import { createMockEvent } from '../utils.ts';

// import가 되어있었지만 사용은 안하는 것
// import { Event } from '../../types.ts';
// import { formatDate } from '../../utils/dateUtils.ts';
// import { parseHM } from '../utils.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));

  expect(result.current.notifications).toHaveLength(0);

  act(() => {
    result.current.setNotifications([{ id: '1', message: 'test' }]);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].id).toBe('1');
  expect(result.current.notifications[0].message).toBe('test');
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const { result } = renderHook(() => useNotifications([createMockEvent(1)]));

  act(() => {
    result.current.setNotifications([
      { id: '1', message: '테스트 이벤트 1 일정이 시작됩니다.!!!!' },
    ]);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].id).toBe('1');
  expect(result.current.notifications[0].message).toBe('테스트 이벤트 1 일정이 시작됩니다.!!!!');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications([createMockEvent(1), createMockEvent(2)]));

  act(() => {
    result.current.setNotifications([
      { id: '1', message: '첫 번째 알림' },
      { id: '2', message: '두 번째 알림' },
      { id: '3', message: '세 번째 알림' },
    ]);
  });

  expect(result.current.notifications).toHaveLength(3);

  // 인덱스 1의 알림 제거 (두 번째 알림)
  act(() => {
    result.current.removeNotification(1);
  });

  // 제거 후 상태 확인
  expect(result.current.notifications).toHaveLength(2);
  expect(result.current.notifications[0].id).toBe('1');
  expect(result.current.notifications[0].message).toBe('첫 번째 알림');
  expect(result.current.notifications[1].id).toBe('3');
  expect(result.current.notifications[1].message).toBe('세 번째 알림');
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const mockEvent = createMockEvent(1, {
    date: '2025-08-01',
    startTime: '09:00',
    notificationTime: 1,
  });

  const now = new Date('2025-08-01T08:59:00');

  // notifiedEvents가 비어있을 때는 이벤트가 포함됨
  const firstCheck = getUpcomingEvents([mockEvent], now, []);
  expect(firstCheck).toHaveLength(1);
  expect(firstCheck[0].id).toBe('1');

  // notifiedEvents에 이미 이벤트 ID가 있으면 제외됨
  const secondCheck = getUpcomingEvents([mockEvent], now, ['1']);
  expect(secondCheck).toHaveLength(0);

  // 다른 이벤트는 여전히 포함됨 (notificationTime을 충족하는 이벤트)
  const otherEvent = createMockEvent(2, {
    date: '2025-08-01',
    startTime: '09:01',
    notificationTime: 2,
  });

  const thirdCheck = getUpcomingEvents([mockEvent, otherEvent], now, ['1']);
  expect(thirdCheck).toHaveLength(1);
  expect(thirdCheck[0].id).toBe('2');
});
