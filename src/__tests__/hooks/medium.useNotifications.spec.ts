import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

// 기존 '초기 상태'는 모호함. msw는 기본적으로 이벤트가 존재하므로,
// Events 빈배열인 상태를 초기 상태로 가정
it('초기 상태에서는 알림이 없어야 한다', () => {
  const events: Event[] = [];
  const { result } = renderHook(() => useNotifications(events));

  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {});
