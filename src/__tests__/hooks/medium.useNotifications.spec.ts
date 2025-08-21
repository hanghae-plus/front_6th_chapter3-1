import { act, renderHook, waitFor } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { makeEvent } from '../factories/eventFactory';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

it('초기 상태에서는 알림 목록에 알림이 없어야 한다.', async () => {
  const event = makeEvent();
  const { result } = renderHook(() => useNotifications([event]));
  await waitFor(() => expect(result.current.notifications.length).toBe(0));
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  const event = makeEvent({ date: '2025-10-15', startTime: '09:00', notificationTime: 10 });
  const { result } = renderHook(() => useNotifications([event]));

  const start = new Date(`${event.date}T${event.startTime}`);
  await act(async () => {
    vi.setSystemTime(new Date(start.getTime() - 60000));
    vi.advanceTimersByTime(1000);
  });

  await waitFor(() => expect(result.current.notifications.length).toBe(1));
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
  const event = makeEvent({ date: '2025-10-15', startTime: '09:00', notificationTime: 10 });
  const { result } = renderHook(() => useNotifications([event]));

  const start = new Date(`${event.date}T${event.startTime}`);
  await act(async () => {
    vi.setSystemTime(new Date(start.getTime() - 60000));
    vi.advanceTimersByTime(1000);
  });

  await waitFor(() => expect(result.current.notifications.length).toBe(1));

  await act(async () => {
    result.current.removeNotification(0);
  });

  await waitFor(() => expect(result.current.notifications.length).toBe(0));
});

it('이미 알림이 발생한 이벤트에 대해서 다시 시간이 흘러도 알림 목록에 추가되지 않아야 한다.', async () => {
  const event = makeEvent({
    id: '1',
    date: '2025-10-15',
    startTime: '09:00',
    notificationTime: 10,
  });
  const { result } = renderHook(() => useNotifications([event]));

  const start = new Date(`${event.date}T${event.startTime}`);
  await act(async () => {
    vi.setSystemTime(new Date(start.getTime() - 60000));
    vi.advanceTimersByTime(1000);
  });

  await waitFor(() => expect(result.current.notifications.length).toBe(1));

  await waitFor(() => expect(result.current.notifiedEvents).toEqual(['1']));

  await act(async () => {
    vi.advanceTimersByTime(1000);
  });

  await waitFor(() => expect(result.current.notifications.length).toBe(1));
});
