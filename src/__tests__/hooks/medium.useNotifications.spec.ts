import { act, renderHook, waitFor } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { makeEvent } from '../factories/eventFactory';
import { parseHM } from '../utils.ts';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', async () => {
  const event = makeEvent();
  const { result } = renderHook(() => useNotifications([event]));
  await waitFor(() => expect(result.current.notifications.length).toBe(0));
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  const event = makeEvent({ date: '2025-10-15', startTime: '09:00', notificationTime: 10 });
  const { result } = renderHook(() => useNotifications([event]));

  const start = new Date(`${event.date}T${event.startTime}`);
  await act(async () => {
    vi.setSystemTime(new Date(start.getTime() - 60_000));
    vi.advanceTimersByTime(1000);
  });

  await waitFor(() => expect(result.current.notifications.length).toBe(1));
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
  const event = makeEvent({ date: '2025-10-15', startTime: '09:00', notificationTime: 10 });
  const { result } = renderHook(() => useNotifications([event]));

  const start = new Date(`${event.date}T${event.startTime}`);
  await act(async () => {
    vi.setSystemTime(new Date(start.getTime() - 60_000));
    vi.advanceTimersByTime(1000);
  });

  await waitFor(() => expect(result.current.notifications.length).toBe(1));

  await act(async () => {
    result.current.removeNotification(0);
  });

  await waitFor(() => expect(result.current.notifications.length).toBe(0));
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {});
