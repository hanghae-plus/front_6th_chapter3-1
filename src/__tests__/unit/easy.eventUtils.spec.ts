import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { dummyEvent } from '../data/dummy';

describe('getFilteredEvents', () => {
  let events: Event[];

  let event1: Event;
  let event2: Event;
  let event3: Event;
  let event4: Event;

  beforeEach(() => {
    event1 = {
      ...dummyEvent,
      id: '1',
      title: 'EVENT 1',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
    };
    event2 = {
      ...dummyEvent,
      id: '2',
      title: 'event 2',
      date: '2025-07-02',
      startTime: '14:00',
      endTime: '15:00',
    };
    event3 = {
      ...dummyEvent,
      id: '3',
      title: '미팅',
      date: '2025-07-15',
      startTime: '09:00',
      endTime: '10:00',
    };
    event4 = {
      ...dummyEvent,
      id: '4',
      title: '점심 약속',
      date: '2025-07-31',
      startTime: '12:00',
      endTime: '13:00',
    };

    events = [event1, event2, event3, event4];
  });

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, 'event 2', new Date(2025, 6, 1), 'month');

    expect(result).toEqual([event2]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date(2025, 6, 1), 'week');

    expect(result).toEqual([event1, event2]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date(2025, 6, 15), 'month');

    expect(result).toEqual([event1, event2, event3, event4]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, 'EVENT', new Date(2025, 6, 1), 'week');

    expect(result).toEqual([event1, event2]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date(2025, 6, 15), 'month');

    expect(result).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, 'EVENT', new Date(2025, 6, 15), 'month');

    expect(result).toEqual([event1, event2]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const boundaryEvent1 = {
      ...dummyEvent,
      id: '5',
      title: '월초 이벤트',
      date: '2025-07-01',
      startTime: '00:00',
      endTime: '01:00',
    };
    const boundaryEvent2 = {
      ...dummyEvent,
      id: '6',
      title: '월말 이벤트',
      date: '2025-07-31',
      startTime: '23:00',
      endTime: '23:59',
    };
    const allEvents = [...events, boundaryEvent1, boundaryEvent2];

    const result = getFilteredEvents(allEvents, '', new Date(2025, 6, 15), 'month');

    expect(result).toEqual(allEvents);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '이벤트', new Date(2025, 6, 15), 'month');

    expect(result).toEqual([]);
  });
});
