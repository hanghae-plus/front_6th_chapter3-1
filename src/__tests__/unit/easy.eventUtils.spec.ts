import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { createMockEvent } from '../utils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const searchTerm = '이벤트 2';
    const events = [
      createMockEvent(1, { title: '이벤트 1', date: '2025-07-01' }),
      createMockEvent(2, { title: '이벤트 2', date: '2025-07-03' }),
      createMockEvent(3, { title: '이벤트 3', date: '2025-07-05' }),
    ];

    expect(getFilteredEvents(events, searchTerm, new Date('2025-07-01'), 'week')).toEqual([
      events[1],
    ]);

    expect(getFilteredEvents(events, searchTerm, new Date('2025-07-01'), 'month')).toEqual([
      events[1],
    ]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const events = [
      createMockEvent(1, { title: '이벤트 1', date: '2025-07-01' }),
      createMockEvent(2, { title: '이벤트 2', date: '2025-07-03' }),
      createMockEvent(3, { title: '이벤트 3', date: '2025-07-15' }),
    ];

    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'week')).toEqual([
      events[0],
      events[1],
    ]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const events = [
      createMockEvent(1, { title: '이벤트 1', date: '2025-07-01' }),
      createMockEvent(2, { title: '이벤트 2', date: '2025-07-03' }),
      createMockEvent(3, { title: '이벤트 3', date: '2025-07-15' }),
      createMockEvent(4, { title: '이벤트 4', date: '2025-08-01' }),
    ];

    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'month')).toEqual([
      events[0],
      events[1],
      events[2],
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const searchTerm = '이벤트';
    const events = [
      createMockEvent(1, { title: '이벤트 1', date: '2025-07-01' }),
      createMockEvent(2, { title: '이벤트 2', date: '2025-07-03' }),
      createMockEvent(3, { title: '점심 미팅', date: '2025-07-04' }),
      createMockEvent(4, { title: '이벤트 3', date: '2025-07-15' }),
    ];

    expect(getFilteredEvents(events, searchTerm, new Date('2025-07-01'), 'week')).toEqual([
      events[0],
      events[1],
    ]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events = [
      createMockEvent(1, { title: '이벤트 1', date: '2025-07-01' }),
      createMockEvent(2, { title: '이벤트 2', date: '2025-07-03' }),
      createMockEvent(3, { title: '점심 미팅', date: '2025-07-04' }),
      createMockEvent(4, { title: '이벤트 3', date: '2025-07-15' }),
    ];

    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'month')).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const searchTerm = 'test';
    const events = [
      createMockEvent(1, { title: 'Test Event 1', date: '2025-07-01' }),
      createMockEvent(2, { title: 'test Event 2', date: '2025-07-03' }),
    ];

    expect(getFilteredEvents(events, searchTerm, new Date('2025-07-01'), 'week')).toEqual([
      events[0],
      events[1],
    ]);

    expect(getFilteredEvents(events, searchTerm, new Date('2025-07-01'), 'month')).toEqual([
      events[0],
      events[1],
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events = [
      createMockEvent(6, { title: '이벤트 4', date: '2025-06-30' }),
      createMockEvent(1, { title: '이벤트 1', date: '2025-07-01' }),
      createMockEvent(4, { title: '이벤트 2', date: '2025-07-31' }),
      createMockEvent(5, { title: '이벤트 3', date: '2025-08-01' }),
    ];

    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'month')).toEqual([
      events[1],
      events[2],
    ]);

    expect(getFilteredEvents(events, '', new Date('2025-07-31'), 'month')).toEqual([
      events[1],
      events[2],
    ]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [];

    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'week')).toEqual([]);

    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'month')).toEqual([]);
  });
});
