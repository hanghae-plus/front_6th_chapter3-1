import { act, renderHook, waitFor } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { createMockEvent } from '../utils.ts';

describe('useNotifications', () => {
  const events = [createMockEvent(1), createMockEvent(2)];

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications([] as Event[]));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
    const mockEvent = createMockEvent(1, {
      date: '2025-10-01',
      startTime: '00:02',
    });

    const { result } = renderHook(() => useNotifications([mockEvent]));

    // 1초 후 체크
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toEqual([]);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const mockEvent = createMockEvent(1, {
      date: '2025-10-01',
      startTime: '00:01',
      notificationTime: 1,
    });

    const { result } = renderHook(() => useNotifications([mockEvent]));

    // 첫 번째 알림이 생성될 때까지 기다림
    waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    expect(result.current.notifications[0].id).toBe('1');
    expect(result.current.notifiedEvents).toContain('1');

    // 같은 이벤트를 다시 추가해도 중복 알림이 생성되지 않아야 함
    const { result: result2 } = renderHook(() => useNotifications([mockEvent]));

    // 새로운 훅 인스턴스에서도 알림이 생성되지 않아야 함
    waitFor(() => {
      expect(result2.current.notifications).toEqual([]);
    });
  });
});
