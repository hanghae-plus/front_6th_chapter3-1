import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

const initEvent: Event[] = [
  {
    id: '1',
    title: '회의 시간',
    date: '2025-10-01',
    startTime: '00:10',
    endTime: '02:10',
    description: '팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
];

describe('useNotifications 초기 상태', () => {
  // setupTest에서 시간 mock 세팅

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(initEvent));

    expect(result.current.notifications).toEqual([]);
  });
});

describe('useNotifications', () => {
  // setupTest에서 시간 mock 세팅

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
    const { result } = renderHook(() => useNotifications(initEvent));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual({
      id: '1',
      message: '10분 후 회의 시간 일정이 시작됩니다.',
    });
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
    const { result } = renderHook(() => useNotifications(initEvent));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification(0);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
    const { result } = renderHook(() => useNotifications(initEvent));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);

    expect(result.current.notifications).toEqual([
      { id: '1', message: '10분 후 회의 시간 일정이 시작됩니다.' },
    ]);

    // 시간이 지나서 또 발생했는지 확인
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.notifications).toEqual([
      { id: '1', message: '10분 후 회의 시간 일정이 시작됩니다.' },
    ]);
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toEqual(['1']);
  });
});
