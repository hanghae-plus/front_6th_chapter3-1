import { expect } from 'vitest';

import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-08-01',
        description: '이벤트',
        location: '회사',
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-08-01',
        description: '이벤트',
        location: '회사',
      },
    ] as Event[];
    const currentDate = new Date('2025-08-01');
    const filteredEvents = getFilteredEvents(events, '이벤트 2', currentDate, 'week');
    expect(filteredEvents).toEqual([
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-08-01',
        description: '이벤트',
        location: '회사',
      },
    ]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        description: '이벤트',
        location: '회사',
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-20',
        description: '이벤트',
        location: '회사',
      },
    ] as Event[];
    const currentDate = new Date('2025-07-01');

    const filteredEvents = getFilteredEvents(events, '', currentDate, 'week');

    expect(filteredEvents).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        description: '이벤트',
        location: '회사',
      },
    ]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        description: '이벤트',
        location: '회사',
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-20',
        description: '이벤트',
        location: '회사',
      },
    ] as Event[];
    const currentDate = new Date('2025-07-01');

    const filteredEvents = getFilteredEvents(events, '', currentDate, 'month');

    expect(filteredEvents).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        description: '이벤트',
        location: '회사',
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-20',
        description: '이벤트',
        location: '회사',
      },
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        description: '이벤트',
        location: '회사',
      },
      {
        id: '2',
        title: '회의',
        date: '2025-07-03',
        description: '회의',
        location: '회사',
      },
      {
        id: '3',
        title: '이벤트 2',
        date: '2025-07-15',
        description: '이벤트',
        location: '회사',
      },
    ] as Event[];
    const currentDate = new Date('2025-07-01');

    const filteredEvents = getFilteredEvents(events, '이벤트', currentDate, 'week');

    expect(filteredEvents).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        description: '이벤트',
        location: '회사',
      },
    ]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-08-01',
        description: '이벤트',
        location: '회사',
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-08-01',
        description: '이벤트',
        location: '회사',
      },
    ] as Event[];
    const currentDate = new Date('2025-08-01');
    const filteredEvents = getFilteredEvents(events, '', currentDate, 'week');
    expect(filteredEvents).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-08-01',
        description: '이벤트',
        location: '회사',
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-08-01',
        description: '이벤트',
        location: '회사',
      },
    ]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: 'Event 1',
        date: '2025-08-01',
        description: '이벤트',
        location: '회사',
      },
      {
        id: '2',
        title: 'event 2',
        date: '2025-08-01',
        description: '이벤트',
        location: '회사',
      },
    ] as Event[];
    const currentDate = new Date('2025-08-01');
    const filteredEvents = getFilteredEvents(events, 'Event 2', currentDate, 'week');
    expect(filteredEvents).toEqual([
      {
        id: '2',
        title: 'event 2',
        date: '2025-08-01',
        description: '이벤트',
        location: '회사',
      },
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '6월 마지막날',
        date: '2025-06-30',
        description: '이벤트',
        location: '회사',
      },
      {
        id: '2',
        title: '7월 첫날',
        date: '2025-07-01',
        description: '이벤트',
        location: '회사',
      },
      {
        id: '3',
        title: '7월 다른주',
        date: '2025-07-08',
        description: '이벤트',
        location: '회사',
      },
    ] as Event[];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(result).toEqual([
      {
        id: '1',
        title: '6월 마지막날',
        date: '2025-06-30',
        description: '이벤트',
        location: '회사',
      },
      {
        id: '2',
        title: '7월 첫날',
        date: '2025-07-01',
        description: '이벤트',
        location: '회사',
      },
    ]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(result).toEqual([]);
  });
});
