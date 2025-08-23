import { act, renderHook, waitFor } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

describe('useNotifications', () => {
  const createNotificationEvent = (
    id: string,
    title: string,
    date: string,
    startTime: string,
    notificationTime: number
  ): Event => ({
    id,
    title,
    date,
    startTime,
    notificationTime,
    endTime: '11:00',
    description: '설명',
    location: '위치',
    category: '카테고리',
    repeat: { type: 'none', interval: 1 },
  });

  const TEN_MINUTES = 10 * 60 * 1000;

  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications([]));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
    const mockNow = new Date('2025-07-01T09:00:00');
    vi.setSystemTime(mockNow);

    const mockDate = formatDate(mockNow);
    const mockParsedHM = parseHM(mockNow.getTime() + TEN_MINUTES);

    const events = [createNotificationEvent('1', '항해', mockDate, mockParsedHM, 10)];

    const { result } = renderHook(() => useNotifications(events));

    // setInterval이 1초라서 1.5초 대기
    await waitFor(
      () => {
        expect(result.current.notifications).toHaveLength(1);
      },
      { timeout: 1500 }
    );

    expect(result.current.notifications[0]).toEqual({
      id: '1',
      message: '10분 후 항해 일정이 시작됩니다.',
    });
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
    const mockNow = new Date('2025-07-01T09:00:00');
    vi.setSystemTime(mockNow);

    const mockDate = formatDate(mockNow);
    const mockParsedHM = parseHM(mockNow.getTime() + TEN_MINUTES);

    const events = [
      createNotificationEvent('1', '항해 회의', mockDate, mockParsedHM, 10),
      createNotificationEvent('2', '항해 점심', mockDate, mockParsedHM, 10),
    ];

    const { result } = renderHook(() => useNotifications(events));

    await waitFor(
      () => {
        expect(result.current.notifications).toHaveLength(2);
      },
      { timeout: 1500 }
    );

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual({
      id: '2',
      message: '10분 후 항해 점심 일정이 시작됩니다.',
    });
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
    const mockNow = new Date('2025-07-01T09:00:00');

    // 시간을 09:00:00로 고정
    vi.setSystemTime(mockNow);

    const mockDate = formatDate(mockNow);
    const mockParsedHM = parseHM(mockNow.getTime() + TEN_MINUTES);

    const events = [createNotificationEvent('1', '항해', mockDate, mockParsedHM, 10)];

    const { result } = renderHook(() => useNotifications(events));

    await waitFor(
      () => {
        expect(result.current.notifications).toHaveLength(1);
      },
      { timeout: 1500 }
    );

    const beforeNotiCount = result.current.notifications.length;
    const beforeNotiEventsCount = result.current.notifiedEvents.length;

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    });

    const afterNotiCount = result.current.notifications.length;
    const afterNotiEventsCount = result.current.notifiedEvents.length;

    expect(afterNotiCount).toBe(beforeNotiCount);
    expect(afterNotiEventsCount).toBe(beforeNotiEventsCount);
  });
});
