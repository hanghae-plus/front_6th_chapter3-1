import { act, renderHook } from '@testing-library/react';
import { createTestEvent } from '../utils.ts';
import { useNotifications } from '../../hooks/useNotifications.ts';

const testEvent = [
  createTestEvent({
    id: '1',
    title: '테스트 이벤트',
    date: '2025-08-21',
    startTime: '10:00',
    endTime: '11:00',
    notificationTime: 10,
  }),
  createTestEvent({
    id: '2',
    title: '테스트 이벤트2',
    date: '2025-08-22',
    startTime: '10:00',
    endTime: '11:00',
    notificationTime: 10,
  }),
  createTestEvent({
    id: '3',
    title: '테스트 이벤트3',
    date: '2025-08-23',
    startTime: '10:00',
    endTime: '11:00',
    notificationTime: 10,
  }),
];

const enqueueSnackbarFn = vi.fn();
const fakeTimers = vi.useFakeTimers();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

beforeEach(() => {
  enqueueSnackbarFn.mockClear();
  fakeTimers.setSystemTime(new Date('2025-08-21T10:00:00'));
});

describe('초기 상태', () => {
  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications([]));

    expect(result.current.notifications).toEqual([]);
  });
});

describe('알림 생성/제거', () => {
  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    fakeTimers.setSystemTime(new Date('2025-08-21T09:50:00'));

    const { result } = renderHook(() => useNotifications(testEvent));

    // 초기 값 확인
    expect(result.current.notifications).toHaveLength(0);

    act(() => {
      fakeTimers.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toEqual([
      {
        id: '1',
        message: '10분 후 테스트 이벤트 일정이 시작됩니다.',
      },
    ]);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    fakeTimers.setSystemTime(new Date('2025-08-21T09:50:00'));

    const { result } = renderHook(() => useNotifications(testEvent));

    // 초기 값 확인
    expect(result.current.notifications).toHaveLength(0);

    act(() => {
      fakeTimers.advanceTimersByTime(1000);
    });

    // 알림 생성 확인
    expect(result.current.notifiedEvents).toContain('1');

    const { removeNotification } = result.current;
    act(() => {
      removeNotification(0);
    });

    // 알림 제거 확인
    expect(result.current.notifications).toEqual([]);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    fakeTimers.setSystemTime(new Date('2025-08-21T09:50:00'));

    const { result } = renderHook(() => useNotifications(testEvent));

    expect(result.current.notifications).toHaveLength(0);

    act(() => {
      fakeTimers.advanceTimersByTime(1000);
    });

    // 알람생성 확인 (아이디 확인)
    const firstNotification = result.current.notifications[0];
    expect(result.current.notifiedEvents).toHaveLength(1);
    expect(firstNotification.id).toBe('1');

    act(() => {
      fakeTimers.advanceTimersByTime(1000);
    });

    // 중복 생성 확인
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toEqual(firstNotification);
  });
});
