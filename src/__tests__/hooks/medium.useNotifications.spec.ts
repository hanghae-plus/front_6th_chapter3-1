import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useNotifications } from '../../hooks/useNotifications';

describe('useNotifications', () => {
  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.notifications).toHaveLength(0);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const mockDate = new Date('2025-10-15T09:00:00');
    vi.setSystemTime(mockDate);

    const { result } = renderHook(() => useNotifications());

    const mockEvent = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트',
      location: '테스트',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    };

    act(() => {
      result.current.addNotification(mockEvent);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].eventId).toBe('1');

    vi.useRealTimers();
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const mockDate = new Date('2025-10-15T08:50:00');
    vi.setSystemTime(mockDate);

    const { result } = renderHook(() => useNotifications());

    const mockEvent = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트',
      location: '테스트',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    };

    act(() => {
      result.current.addNotification(mockEvent);
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toHaveLength(0);

    vi.useRealTimers();
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const mockDate = new Date('2025-10-15T08:50:00');
    vi.setSystemTime(mockDate);

    const { result } = renderHook(() => useNotifications());

    const mockEvent = {
      id: '1',
      title: '테스트 이벤트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트',
      location: '테스트',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    };

    act(() => {
      result.current.addNotification(mockEvent);
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.addNotification(mockEvent);
    });

    expect(result.current.notifications).toHaveLength(1);

    vi.useRealTimers();
  });
});
