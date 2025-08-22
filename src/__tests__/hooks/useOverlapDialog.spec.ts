import { act, renderHook } from '@testing-library/react';

import { useOverlapDialog } from '../../hooks/useOverlapDialog';
import { Event, EventForm } from '../../types';

const BASE_EVENT_FORM: Event = {
  id: '1',
  title: '팀 회의',
  date: '2025-08-22',
  startTime: '14:00',
  endTime: '15:00',
  description: '필참',
  location: 'A104',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

const EVENT_A: EventForm = {
  title: '기존 회의 A',
  date: '2025-08-22',
  startTime: '16:00',
  endTime: '17:00',
  description: '회의 A',
  location: 'B101',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

const EVENT_B_OVERLAP: EventForm = {
  title: '기존 회의 B (겹침)',
  date: '2025-08-22',
  startTime: '14:30',
  endTime: '14:45',
  description: '회의 B',
  location: 'B102',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

it('openOverlapDialog 호출 시 목록이 설정되고 모달이 열린다', () => {
  const { result } = renderHook(() => useOverlapDialog());

  act(() => {
    result.current.openOverlapDialog([BASE_EVENT_FORM]);
  });

  expect(result.current.isOverlapDialogOpen).toBe(true);
  expect(result.current.overlappingEvents).toEqual([BASE_EVENT_FORM]);
});

it('closeOverlapDialog 호출 시 모달이 닫힌다', () => {
  const { result } = renderHook(() => useOverlapDialog());

  act(() => {
    result.current.openOverlapDialog([BASE_EVENT_FORM]);
  });
  act(() => {
    result.current.closeOverlapDialog();
  });

  expect(result.current.isOverlapDialogOpen).toBe(false);
});

it('isOverlap: 겹치면 true를 반환한다', () => {
  const { result } = renderHook(() => useOverlapDialog());

  const isOverlapping = result.current.isOverlap(EVENT_B_OVERLAP, [BASE_EVENT_FORM]);

  expect(isOverlapping).toBe(true);
});

it('isOverlap: 겹치지 않으면 false를 반환한다', () => {
  const { result } = renderHook(() => useOverlapDialog());

  const isOverlapping = result.current.isOverlap(EVENT_A, [BASE_EVENT_FORM]);

  expect(isOverlapping).toBe(false);
});
