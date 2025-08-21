import { act, renderHook, waitFor } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

const makeEvent = (overrides?: Partial<Event>): Event => {
  const in1m = new Date(Date.now() + 60 * 1000);
  return {
    id: 'event-1',
    title: '알림 대상',
    description: '테스트 설명',
    date: in1m.toISOString().slice(0, 10),
    startTime: in1m.toTimeString().slice(0, 5),
    endTime: '23:59',
    location: '테스트 장소',
    category: 'work',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
    ...(overrides ?? {}),
  } as Event;
};

it('초기 상태에서는 알림이 없어야 한다', () => {
  const events: Event[] = [makeEvent()];
  const { result } = renderHook(() => useNotifications(events));
  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  const base = new Date();
  const target = makeEvent({
    title: '알림 대상',
    notificationTime: 1,
    date: base.toISOString().slice(0, 10),
    startTime: new Date(base.getTime() + 60 * 1000).toTimeString().slice(0, 5),
  });
  const { result } = renderHook(() => useNotifications([target]));

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });

  await waitFor(() => expect(result.current.notifications).toHaveLength(1));
  expect(result.current.notifications[0].message).toEqual('1분 후 알림 대상 일정이 시작됩니다.');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
  const events: Event[] = [makeEvent()];
  const { result } = renderHook(() => useNotifications(events));

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });
  await waitFor(() => expect(result.current.notifications).toHaveLength(1));

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
  // 1분 뒤에 시작하는 이벤트를 생성
  const event = makeEvent({
    title: '중복 알림 테스트',
    notificationTime: 1,
  });
  const events: Event[] = [event];
  const { result } = renderHook(() => useNotifications(events));

  // 1초(1분 전) 타이머를 돌려 알림이 생성되는지 확인
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });
  await waitFor(() => {
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].message).toBe(
      '1분 후 중복 알림 테스트 일정이 시작됩니다.'
    );
  });

  // 추가로 3초(총 4초) 타이머를 돌려도 알림이 중복 생성되지 않는지 확인
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000);
  });

  // 알림이 여전히 1개만 존재해야 함
  expect(result.current.notifications).toHaveLength(1);

  // 알림을 제거한 뒤, 다시 시간이 지나도 중복 알림이 오지 않는지 확인
  act(() => {
    result.current.removeNotification(0);
  });
  expect(result.current.notifications).toHaveLength(0);

  // 10초 더 타이머를 돌려도 알림이 다시 생성되지 않아야 함
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10000);
  });
  expect(result.current.notifications).toHaveLength(0);
});
