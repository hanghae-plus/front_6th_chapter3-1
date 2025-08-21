import { getFilteredEvents } from '../../utils/eventUtils';

import { caseEvent1, caseEvent2 } from './dummies.ts';
import { createEvent } from '../__fixture__/eventFactory.ts';
import { expect } from 'vitest';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    expect(getFilteredEvents(caseEvent1, '이벤트 2', new Date(2025, 6, 1), 'month')).toEqual([
      createEvent({
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    expect(getFilteredEvents(caseEvent1, '', new Date(2025, 6, 1), 'week')).toEqual([
      createEvent({
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createEvent({
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createEvent({
        title: '이벤트 3',
        date: '2025-07-03',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createEvent({
        title: 'event',
        date: '2025-07-05',
        startTime: '10:00',
        endTime: '11:00',
      }),
    ]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(caseEvent1, '이벤트', new Date(2025, 6, 1), 'month')).toEqual([
      createEvent({
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createEvent({
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createEvent({
        title: '이벤트 3',
        date: '2025-07-03',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    expect(getFilteredEvents(caseEvent1, '이벤트', new Date(2025, 6, 1), 'week')).toEqual([
      createEvent({
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createEvent({
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createEvent({
        title: '이벤트 3',
        date: '2025-07-03',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(caseEvent1, '', new Date(2025, 6, 1), 'week')).toEqual([
      createEvent({
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createEvent({
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createEvent({
        title: '이벤트 3',
        date: '2025-07-03',
        startTime: '09:00',
        endTime: '10:00',
      }),
      createEvent({
        title: 'event',
        date: '2025-07-05',
        startTime: '10:00',
        endTime: '11:00',
      }),
    ]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    expect(getFilteredEvents(caseEvent1, 'EVENT', new Date(2025, 6, 1), 'week')).toEqual([
      createEvent({
        title: 'event',
        date: '2025-07-05',
        startTime: '10:00',
        endTime: '11:00',
      }),
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    expect(getFilteredEvents(caseEvent2, '', new Date('2025-07-01'), 'month')).toEqual([
      createEvent({
        title: 'event2',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
      }),
      createEvent({
        title: 'event3',
        date: '2025-07-31',
        startTime: '10:00',
        endTime: '11:00',
      }),
    ]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    expect(getFilteredEvents([], '', new Date('2025-07-01'), 'month')).toEqual([]);
  });
});
