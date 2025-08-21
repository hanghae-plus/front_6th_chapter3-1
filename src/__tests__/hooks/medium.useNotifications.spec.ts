import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import data from '../../__mocks__/response/realEvents.json';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const events = data.events as Array<Event>;
  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toHaveLength(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  const events = data.events as Array<Event>;

  vi.setSystemTime(new Date('2025-08-20T09:59:00'));

  const { result } = renderHook(() => useNotifications(events));

  // 1초 기다리기 (타이머가 실행되도록)
  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
  const events = data.events as Array<Event>;
  const { result } = renderHook(() => useNotifications(events));

  vi.setSystemTime(new Date('2025-08-25T08:59:00'));

  // 1초 기다리기 (타이머가 실행되도록)
  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
  const events = data.events as Array<Event>;
  const { result } = renderHook(() => useNotifications(events));

  vi.setSystemTime(new Date('2025-08-25T08:59:00'));

  // 1초 기다리기 (타이머가 실행되도록)
  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  vi.setSystemTime(new Date('2025-08-25T08:59:00'));

  // 1초 기다리기 (타이머가 실행되도록)
  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
});
