import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { MOCK_EVENTS } from '../mockEvents';

const event2_0701: Event = {
  id: '100',
  title: '이벤트 2',
  date: '2025-07-01',
  startTime: '10:00',
  endTime: '11:00',
  description: 'event2 description',
  location: 'event2 location',
  category: '개인',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 0,
};
const event3_0702: Event = {
  id: '101',
  title: '이벤트 3',
  date: '2025-07-02',
  startTime: '10:00',
  endTime: '11:00',
  description: 'event3 description',
  location: 'event3 location',
  category: '개인',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 0,
};
const event4_0801: Event = {
  id: '102',
  title: '이벤트 4',
  date: '2025-08-01',
  startTime: '10:00',
  endTime: '11:00',
  description: 'event4 description',
  location: 'event4 location',
  category: '개인',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 0,
};
describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    expect(
      getFilteredEvents([...MOCK_EVENTS, event2_0701], '이벤트 2', new Date('2025-07-01'), 'month')
    ).toEqual([event2_0701]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    expect(
      getFilteredEvents([...MOCK_EVENTS, event2_0701], '', new Date('2025-07-01'), 'week')
    ).toEqual([event2_0701]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    expect(
      getFilteredEvents(
        [...MOCK_EVENTS, event2_0701, event3_0702],
        '',
        new Date('2025-07-01'),
        'month'
      )
    ).toEqual([event2_0701, event3_0702]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    expect(
      getFilteredEvents([...MOCK_EVENTS, event2_0701], '이벤트', new Date('2025-07-01'), 'week')
    ).toEqual([event2_0701]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    expect(
      getFilteredEvents(
        [...MOCK_EVENTS, event2_0701, event3_0702],
        '',
        new Date('2025-07-01'),
        'month'
      )
    ).toEqual([event2_0701, event3_0702]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    expect(
      getFilteredEvents(
        [...MOCK_EVENTS, event2_0701, event3_0702],
        'EVENT',
        new Date('2025-07-01'),
        'month'
      )
    ).toEqual([event2_0701, event3_0702]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    //7월일때
    expect(
      getFilteredEvents(
        [event2_0701, event3_0702, event4_0801],
        '',
        new Date('2025-07-01'),
        'month'
      )
    ).toEqual([event2_0701, event3_0702]);

    //8월로 넘어갔을때
    expect(
      getFilteredEvents(
        [event2_0701, event3_0702, event4_0801],
        '',
        new Date('2025-08-01'),
        'month'
      )
    ).toEqual([event4_0801]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    expect(getFilteredEvents([], '', new Date('2025-07-01'), 'month')).toEqual([]);
  });
});
