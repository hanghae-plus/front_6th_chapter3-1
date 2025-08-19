import { act, renderHook, waitFor } from '@testing-library/react';

import { events } from '../../__mocks__/response/events.json';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', async () => {
  const { result } = renderHook(() => useNotifications(events as Event[]));

  waitFor(() => expect(result.current.notifications.length).toBe(0));
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  const { result } = renderHook(() => useNotifications(events as Event[]));

  const start = new Date(`${events[0].date}T${events[0].startTime}`);
  const beforeStart = start.getTime() - 10 * 60000;

  await act(async () => {
    vi.setSystemTime(new Date(beforeStart - 1000));
    vi.advanceTimersByTime(1000);
  });

  waitFor(() => expect(result.current.notifications.length).toBe(1));
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {});
