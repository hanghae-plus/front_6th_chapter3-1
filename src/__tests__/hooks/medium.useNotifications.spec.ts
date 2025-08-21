import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { setTimeEventBeforeSecond } from '../../utils/dateUtils.ts';
import { MOCK_EVENTS, LUNCH_0822 } from '../mockEvents.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(MOCK_EVENTS));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.useFakeTimers();
  vi.setSystemTime(
    setTimeEventBeforeSecond(
      new Date(LUNCH_0822.date),
      LUNCH_0822.startTime,
      LUNCH_0822.notificationTime
    )
  );

  const { result } = renderHook(() => useNotifications([LUNCH_0822]));

  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifiedEvents).toHaveLength(0);

  // 시간 1초 앞당기기
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toHaveLength(1);

  vi.useRealTimers();
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  vi.useFakeTimers();
  vi.setSystemTime(
    setTimeEventBeforeSecond(
      new Date(LUNCH_0822.date),
      LUNCH_0822.startTime,
      LUNCH_0822.notificationTime
    )
  );

  const { result } = renderHook(() => useNotifications([LUNCH_0822]));

  // 시간 1초 앞당기기
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toHaveLength(1);

  // 알림 제거
  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifiedEvents).toHaveLength(1);

  vi.useRealTimers();
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.useFakeTimers();
  vi.setSystemTime(
    setTimeEventBeforeSecond(
      new Date(LUNCH_0822.date),
      LUNCH_0822.startTime,
      LUNCH_0822.notificationTime
    )
  );

  const { result } = renderHook(() => useNotifications([LUNCH_0822]));

  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifiedEvents).toHaveLength(0);

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
});
