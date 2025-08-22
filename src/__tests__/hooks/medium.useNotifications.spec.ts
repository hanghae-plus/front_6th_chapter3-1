import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

const createMockEvent = (id: string, date: string, startTime: string, notificationTime: number): Event => ({
  id,
  title: `Event ${id}`,
  date,
  startTime,
  endTime: '11:00',
  description: '',
  location: '',
  category: '개인',
  repeat: { type: 'none', interval: 1 },
  notificationTime,
});

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications([]));
    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const now = new Date();
    vi.setSystemTime(now);
    const eventTime = new Date(now.getTime() + 10 * 60 * 1000);
    const eventDate = eventTime.toISOString().split('T')[0];
    const eventStartTime = eventTime.toTimeString().slice(0, 5);

    const events = [createMockEvent('1', eventDate, eventStartTime, 10)];
    
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].message).toBe('10분 후 Event 1 일정이 시작됩니다.');
    expect(result.current.notifiedEvents).toEqual(['1']);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const now = new Date();
    vi.setSystemTime(now);
    const eventTime1 = new Date(now.getTime() + 10 * 60 * 1000);
    const eventTime2 = new Date(now.getTime() + 5 * 60 * 1000);
    const events = [
      createMockEvent('1', eventTime1.toISOString().split('T')[0], eventTime1.toTimeString().slice(0, 5), 10),
      createMockEvent('2', eventTime2.toISOString().split('T')[0], eventTime2.toTimeString().slice(0, 5), 5),
    ];

    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications.length).toBe(2);

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].id).toBe('2');
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    const now = new Date();
    vi.setSystemTime(now);
    const eventTime = new Date(now.getTime() + 10 * 60 * 1000);
    const eventDate = eventTime.toISOString().split('T')[0];
    const eventStartTime = eventTime.toTimeString().slice(0, 5);

    const events = [createMockEvent('1', eventDate, eventStartTime, 10)];
    
    const { result } = renderHook(() => useNotifications(events));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifiedEvents).toEqual(['1']);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.notifications.length).toBe(1);
  });
});