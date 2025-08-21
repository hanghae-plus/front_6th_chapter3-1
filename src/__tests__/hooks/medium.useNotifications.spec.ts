import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { createMockEvent } from '../utils.ts';

/**타이머 앞당기기 */
const advanceTime = async (minutes: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(minutes * 60 * 1000);
  });
};

describe('useNotifications: 예정된 이벤트를 주기적으로 확인하고 알림 생성', () => {
  // ? setupTest에서 설정을 했는데, 여기서 다시 설정을 하는거지? 근데 안하면 통과가 안된다.
  // > 시간까지 설정했더니 되네... 기존 2025-10-01에서 2025-10-01 00:00:00 으로 설정을 바꿨다.
  // > 이번엔 캘린더 훅 테스트에서 터짐... 그냥 여기서만 시간 설정하는 걸로...

  //그리고 shouldAdvanceTime: true 로 설정하면 타이머가 자동으로 진행된다라는 말이 있던데, 왜 안 흐를까..

  beforeEach(() => {
    // 시간을 2025-10-01 00:00:00으로 설정
    vi.setSystemTime(new Date('2025-10-01 00:00:00'));
  });

  describe('초기 상태', () => {
    it('초기 상태에서는 알림이 없어야 한다', () => {
      const { result } = renderHook(() => useNotifications([]));

      expect(result.current.notifications).toEqual([]);
      expect(result.current.notifiedEvents).toEqual([]);
    });
  });

  describe('알림 생성', () => {
    it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
      const events = [
        createMockEvent(1, {
          date: '2025-10-01',
          startTime: '00:02',
          notificationTime: 1, // 1분 전 알림
        }),
      ];

      const { result } = renderHook(() => useNotifications(events));

      // 1분 후 체크 (00:01:00이 되어 알림 조건 만족)
      await advanceTime(1);

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].id).toBe('1');
      expect(result.current.notifications[0].message).toContain('1분 후');
    });

    it('알림 시간이 되지 않은 경우 알림이 생성되지 않는다', async () => {
      const events = [
        createMockEvent(1, {
          date: '2025-10-01',
          startTime: '00:02',
          notificationTime: 1, // 1분 전 알림
        }),
      ];

      const { result } = renderHook(() => useNotifications(events));

      // 30초 후 체크 (아직 알림 시간이 아님)
      await advanceTime(0.5);

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('알림 제거', () => {
    it('index를 기준으로 해당 index의 알림을 제거할 수 있다', async () => {
      const events = [
        createMockEvent(1, {
          date: '2025-10-01',
          startTime: '00:02',
          notificationTime: 1,
        }),
        createMockEvent(2, {
          date: '2025-10-01',
          startTime: '00:20',
          notificationTime: 1,
        }),
      ];

      const { result } = renderHook(() => useNotifications(events));

      // 알림이 생성될 때까지 대기
      await advanceTime(1);

      // 알림이 생성되었는지 확인
      expect(result.current.notifications).toHaveLength(1);

      // 첫 번째 알림 제거
      act(() => {
        result.current.removeNotification(0);
      });

      // 알림이 제거되었는지 확인
      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('중복 알림 방지', () => {
    it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
      const events = [
        createMockEvent(1, {
          date: '2025-10-01',
          startTime: '00:02',
          notificationTime: 1,
        }),
      ];

      const { result } = renderHook(() => useNotifications(events));

      // 1분 후 알림 생성
      await advanceTime(1);

      // 알림 생성 확인
      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].id).toBe('1');

      // 1분 추가 후 알림 확인
      await advanceTime(1);

      // 여전히 1번 알림만 존재해야 함
      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].id).toBe('1');
    });
  });
});
