import { expect } from 'vitest';

import { getFilteredEvents } from '../../utils/eventUtils';
import { createEventMock } from '../utils.ts';

const sampleEvents = [
  createEventMock({
    id: '1',
    date: '2025-07-01',
    description: 'event 1',
  }),
  createEventMock({
    id: '2',
    date: '2025-07-10',
    description: 'event 2',
  }),
  createEventMock({
    id: '3',
    date: '2025-07-08',
    description: 'Event 3',
  }),
  createEventMock({
    id: '4',
    date: '2025-08-20',
    description: '이벤트 1',
  }),
  createEventMock({
    id: '5',
    date: '2025-08-23',
    description: '이벤트 2',
  }),
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const searchTerm = '이벤트 2';
    const currentDate = new Date('2025-08-20');
    const filteredEvents = getFilteredEvents(sampleEvents, searchTerm, currentDate, 'month');

    expect(filteredEvents).toEqual([sampleEvents[4]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const searchDate = new Date('2025-07-01');
    const filteredEvents = getFilteredEvents(sampleEvents, '', searchDate, 'week');

    expect(filteredEvents).toEqual([sampleEvents[0]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const searchDate = new Date('2025-07-01');
    const filteredEvents = getFilteredEvents(sampleEvents, '', searchDate, 'month');

    expect(filteredEvents).toEqual([sampleEvents[0], sampleEvents[1], sampleEvents[2]]);
  });

  it("오늘 기준 검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const searchTerm = '이벤트';
    const today = new Date();
    const events = [
      createEventMock({
        id: '6',
        title: '이벤트',
        date: today.toString(),
      }),
      createEventMock({
        id: '7',
        title: '2벤트',
        date: today.toString(),
      }),
    ];

    const filteredEvents = getFilteredEvents(events, searchTerm, today, 'week');

    expect(filteredEvents).toEqual([events[0]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const date = new Date('2025-08-20');
    const filteredEvents = getFilteredEvents(sampleEvents, '', date, 'month');

    expect(filteredEvents).toEqual([sampleEvents[3], sampleEvents[4]]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const searchTerm = 'event';
    const date = new Date('2025-07-01');
    const filteredEvents = getFilteredEvents(sampleEvents, searchTerm, date, 'month');

    expect(filteredEvents).toEqual([sampleEvents[0], sampleEvents[1], sampleEvents[2]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const endOfJul = new Date('2025-07-31');
    const firstOfAug = new Date('2025-08-01');
    const monthBoundaryEvents = [
      createEventMock({
        id: '8',
        date: '2025-07-31',
      }),
      createEventMock({
        id: '9',
        date: '2025-08-01',
      }),
    ];

    const endOfJulEvents = getFilteredEvents(monthBoundaryEvents, '', endOfJul, 'month');
    const firstOfAugEvents = getFilteredEvents(monthBoundaryEvents, '', firstOfAug, 'month');

    expect(endOfJulEvents).toEqual([monthBoundaryEvents[0]]);
    expect(firstOfAugEvents).toEqual([monthBoundaryEvents[1]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const date = new Date('2025-08-20');
    const emptyEvents = getFilteredEvents([], '', date, 'month');

    expect(emptyEvents).toEqual([]);
  });
});
