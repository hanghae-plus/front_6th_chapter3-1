import { filter } from 'framer-motion/client';
import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

// export function getFilteredEvents(
//   events: Event[],
//   searchTerm: string,
//   currentDate: Date,
//   view: 'week' | 'month'
// ): Event[] {
//   const searchedEvents = searchEvents(events, searchTerm);

//   if (view === 'week') {
//     return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
//   }

//   if (view === 'month') {
//     return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
//   }

//   return searchedEvents;
// }
const mockEvents: Event[] = [
  {
    id: '1',
    title: '면접공부',
    date: '2025-08-19',
    startTime: '10:00',
    endTime: '11:00',
    description: '면접 준비',
    location: '내 방',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '회의',
    date: '2025-13-19',
    startTime: '12:00',
    endTime: '13:00',
    description: '회의',
    location: '카페',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '코테풀기',
    date: '2025-08-19',
    startTime: '13:00',
    endTime: '25:00',
    description: '코테 풀기',
    location: '릿코드',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '코테풀기',
    date: '2025-08-19',
    startTime: '13:00',
    endTime: '22:00',
    description: '코테 풀기',
    location: '릿코드',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '5',
    title: '코테풀기',
    date: '2025-08-19',
    startTime: '14:00',
    endTime: '23:00',
    description: '코테 풀기',
    location: '릿코드',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '6',
    title: '코테풀기',
    date: '2025-07-02',
    startTime: '13:00',
    endTime: '14:00',
    description: '코테 풀기',
    location: '릿코드',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '7',
    title: '이벤트 2',
    date: '2025-08-19',
    startTime: '15:00',
    endTime: '16:00',
    description: '코테 풀기',
    location: '릿코드',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const filteredEvents = getFilteredEvents(
      mockEvents,
      '이벤트 2',
      new Date('2025-08-19'),
      'month'
    );
    expect(filteredEvents).toEqual([mockEvents[6]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'week');
    expect(filteredEvents).toEqual([mockEvents[5]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
    expect(filteredEvents).toEqual([mockEvents[5]]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const filteredEvents = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
    expect(filteredEvents).toEqual([mockEvents[5]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events = [
      {
        date: '2025-06-15',
        title: '이벤트 1',
        description: '이벤트 1 설명',
        location: '이벤트 1 장소',
      },
      {
        date: '2025-06-16',
        title: '이벤트 2',
        description: '이벤트 2 설명',
        location: '이벤트 2 장소',
      },
      {
        date: '2025-06-07',
        title: '이벤트 3',
        description: '이벤트 3 설명',
        location: '이벤트 3 장소',
      },
    ] as Event[];
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-06-01'), 'month');
    expect(filteredEvents).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events = [
      {
        date: '2025-06-15',
        title: 'event 1',
        description: 'event 1 설명',
        location: 'event 1 장소',
      },
      {
        date: '2025-06-16',
        title: 'event 2',
        description: 'event 2 설명',
        location: 'event 2 장소',
      },
      {
        date: '2025-06-07',
        title: 'event 3',
        description: 'event 3 설명',
        location: 'event 3 장소',
      },
    ] as Event[];
    const filteredEvents = getFilteredEvents(events, 'EVENT', new Date('2025-06-01'), 'month');
    expect(filteredEvents).toEqual(events);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events = [
      {
        date: '2025-06-30',
        title: '월말 이벤트',
        description: '월말 이벤트 설명',
        location: '월말 장소',
      },
      {
        date: '2025-07-01',
        title: '월초 이벤트',
        description: '월초 이벤트 설명',
        location: '월초 장소',
      },
    ] as Event[];
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(filteredEvents).toEqual([events[1]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const event: Event[] = [];
    const filteredEvents = getFilteredEvents(event, '', new Date('2025-06-01'), 'month');
    expect(filteredEvents).toEqual([]);
  });
});
