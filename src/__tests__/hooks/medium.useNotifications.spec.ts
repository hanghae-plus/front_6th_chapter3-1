import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
// TODO formatDate, parseHM 어디에 적용하면 좋을지 생각해보기
// TODO Describe로 묶었을 때 시간이 제대로 적용되지 않는 부분 확인하기
import { formatDate } from '../../utils/dateUtils.ts';
import { createEventMock, parseHM } from '../utils.ts';

const sampleEvents: Event[] = [
  createEventMock({
    id: '1',
    title: '테스트 이벤트 1',
    date: '2025-08-22',
    startTime: '08:00',
    endTime: '10:00',
    notificationTime: 20,
  }),
];

beforeEach(() => {
  vi.useFakeTimers();
  // 알림 트리거 시각을 notificationTime에 맞춰 20분 전인 07:40으로 설정
  vi.setSystemTime(new Date('2025-08-22T07:40:00'));
});

// 실제 타이머로 복귀하기
afterEach(() => {
  vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(sampleEvents));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const { result } = renderHook(() => useNotifications(sampleEvents));

  // useNotification에서 setInterval이 1000초로 되어있음
  act(() => {
    // 가짜 시간을 흐르게 해준다 1초 흐르기
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0]).toEqual({
    id: '1',
    message: '20분 후 테스트 이벤트 1 일정이 시작됩니다.',
  });
  expect(result.current.notifiedEvents).toEqual(['1']);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications(sampleEvents));

  // 우선 알림을 만들기 위해 시간을 흐르게 하자
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(result.current.notifications).toHaveLength(1);

  // 지우기
  act(() => {
    result.current.removeNotification(0);
  });

  // 지우면 notification의 길이는 0
  expect(result.current.notifications).toHaveLength(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  // 알림이 발생했고, 그 이후 시간이 지나도 동일한 알림이 발생하지 않는다로 이해

  const { result } = renderHook(() => useNotifications(sampleEvents));

  // 우선 알림 하나 생성
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toEqual(['1']);

  // 시간이 더 흘러도 동일 이벤트는 재알림 X
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  expect(result.current.notifications).toHaveLength(1);
});
