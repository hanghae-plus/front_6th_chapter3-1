import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events = [
      {
        date: '2025-07-01',
        title: '이벤트 1',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
      },
      {
        date: '2025-07-01',
        title: '이벤트 2',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
      },
    ] as Event[];

    const filteredEvents = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'week');
    expect(filteredEvents).toEqual([events[1]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const events = [
      {
        date: '2025-06-05',
        title: '이벤트 1',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
      },
      {
        date: '2025-07-03',
        title: '이벤트 2',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
      },
      {
        date: '2025-08-01',
        title: '이벤트 3',
        description: '이벤트 3 설명',
        location: '이벤트 3 장소',
      },
    ] as Event[];

    const filteredEvents = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');
    expect(filteredEvents).toEqual([events[1]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const events = [
      {
        date: '2025-06-01',
        title: '이벤트 1',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
      },
      {
        date: '2025-07-01',
        title: '이벤트 2',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
      },
      {
        date: '2025-08-01',
        title: '이벤트 3',
        description: '이벤트 3 설명',
        location: '이벤트 3 장소',
      },
    ] as Event[];

    const filteredEvents = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'month');
    expect(filteredEvents).toEqual([events[1]]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events = [
      {
        date: '2025-06-15',
        title: '이벤트 1',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
      },
      {
        date: '2025-06-30',
        title: '이벤트 2',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
      },
      {
        date: '2025-07-01',
        title: '이벤트 3',
        description: '이벤트 3 설명',
        location: '이벤트 3 장소',
      },
      {
        date: '2025-07-15',
        title: '이벤트 4',
        description: '이벤트 4 설명',
        location: '이벤트 4 장소',
      },
      {
        date: '2025-07-30',
        title: '이벤트 5',
        description: '이벤트 5 설명',
        location: '이벤트 5 장소',
      },
    ] as Event[];
    const filteredEvents = getFilteredEvents(events, '이벤트', new Date('2025-07-03'), 'week');
    expect(filteredEvents).toEqual([events[1], events[2]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events = [
      {
        date: '2025-07-01',
        title: '이벤트 1',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
      },
      {
        date: '2025-07-02',
        title: '이벤트 2',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
      },
      {
        date: '2025-07-03',
        title: '이벤트 3',
        description: '이벤트 3 설명',
        location: '이벤트 3 장소',
      },
    ] as Event[];

    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(filteredEvents).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events = [
      {
        date: '2025-07-01',
        title: 'EVENT 1',
        description: 'EVENT 1 설명',
        location: 'EVENT 1 장소',
      },
      {
        date: '2025-07-02',
        title: 'EVENT 2',
        description: 'EVENT 2 설명',
        location: 'EVENT 2 장소',
      },
      {
        date: '2025-07-03',
        title: 'EVENT 3',
        description: 'EVENT 3 설명',
        location: 'EVENT 3 장소',
      },
    ] as Event[];
    const filteredEvents = getFilteredEvents(events, 'event', new Date('2025-07-01'), 'week');
    expect(filteredEvents).toEqual([events[0], events[1], events[2]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events = [
      {
        date: '2025-07-31',
        title: '이벤트 2',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
      },
    ] as Event[];

    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(filteredEvents).toEqual([events[0]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events = [] as Event[];
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-08-01'));
    expect(filteredEvents).toEqual([]);
  });
});
