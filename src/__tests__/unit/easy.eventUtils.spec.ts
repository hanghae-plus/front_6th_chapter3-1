import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const events = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-07-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2025-07-02',
    startTime: '14:00',
    endTime: '15:00',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '3',
    title: '이벤트 3',
    date: '2025-07-31',
    startTime: '14:00',
    endTime: '15:00',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '4',
    title: 'EvEnT 4',
    date: '2025-07-31',
    startTime: '14:00',
    endTime: '15:00',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '5',
    title: 'EvEnT 5',
    date: '2025-08-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
] as Event[];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const filteredEvents = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'month');

    expect(filteredEvents).toEqual([events[1]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual([events[0], events[1]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(filteredEvents).toEqual([events[0], events[1], events[2], events[3]]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const filteredEvents = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');

    expect(filteredEvents).toEqual([events[0], events[1]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(filteredEvents).toEqual([events[0], events[1], events[2], events[3]]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filteredEvents = getFilteredEvents(events, 'event', new Date('2025-07-01'), 'month');

    expect(filteredEvents).toEqual([events[3]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-31'), 'month');

    expect(filteredEvents).toEqual([events[0], events[1], events[2], events[3]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const filteredEvents = getFilteredEvents([], '', new Date('2025-07-01'), 'month');

    expect(filteredEvents).toEqual([]);
  });
});
