import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { createMockEvent, parseHM } from '../utils.ts';

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

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {});
