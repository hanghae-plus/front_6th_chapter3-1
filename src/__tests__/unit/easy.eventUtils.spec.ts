import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const event1: Event = {
    id: '',
    title: '이벤트 2',
    description: '이벤트설명',
    category: '카테고리1',
    date: '2025-08-21',
    startTime: '09:00',
    endTime: '14:30',
    location: '어딘가',
    notificationTime: 0,
    repeat: { interval: 0, type: 'daily', endDate: '' },
  };

  const event2: Event = {
    id: '',
    title: '이벤트A',
    description: '이벤트설명',
    category: '카테고리1',
    date: '2025-08-21',
    startTime: '09:00',
    endTime: '14:30',
    location: '어딘가',
    notificationTime: 0,
    repeat: { interval: 0, type: 'daily', endDate: '' },
  };

  const event3: Event = {
    id: '',
    title: '이벤트B',
    description: '이벤트설명',
    category: '카테고리1',
    date: '2025-08-21',
    startTime: '09:00',
    endTime: '14:30',
    location: '어딘가',
    notificationTime: 0,
    repeat: { interval: 0, type: 'daily', endDate: '' },
  };

  const event4: Event = {
    id: '',
    title: '이벤트C',
    description: '이벤트설명',
    category: '카테고리1',
    date: '2025-07-02',
    startTime: '09:00',
    endTime: '14:30',
    location: '어딘가',
    notificationTime: 0,
    repeat: { interval: 0, type: 'daily', endDate: '' },
  };

  const event5: Event = {
    id: '',
    title: '이벤트D',
    description: '이벤트설명',
    category: '카테고리1',
    date: '2025-07-07',
    startTime: '09:00',
    endTime: '14:30',
    location: '어딘가',
    notificationTime: 0,
    repeat: { interval: 0, type: 'daily', endDate: '' },
  };

  const events: Event[] = [event1, event2, event3, event4, event5];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    expect(getFilteredEvents(events, '이벤트 2', new Date('2025-08-21'), 'month')).toEqual([
      event1,
    ]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'week')).toEqual([event4]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'month')).toEqual([
      event4,
      event5,
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    expect(getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week')).toEqual([event4]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'week')).toEqual([event4]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    expect(getFilteredEvents(events, '이벤트d', new Date('2025-07-01'), 'month')).toEqual([event5]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    expect(getFilteredEvents(events, '이벤트d', new Date('2025-07-01'), 'month')).toEqual([event5]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    expect(getFilteredEvents([], '', new Date('2025-07-01'), 'week')).toEqual([]);
  });
});
