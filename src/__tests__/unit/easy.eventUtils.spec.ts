import { Event } from '../../types';
import { createEventData } from './factories/eventFactory';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const date = '2025-08-01';

    // title 검색
    const titleEvent1 = createEventData({
      title: '이벤트 1',
      date,
    });
    const titleEvent2 = createEventData({
      title: '이벤트 2',
      date,
    });
    const titleEvent3 = createEventData({
      title: '이벤트 3',
      date,
    });

    expect(
      getFilteredEvents([titleEvent1, titleEvent2, titleEvent3], '이벤트 2', new Date(date), 'week')
    ).toEqual([titleEvent2]);

    // description 검색
    const descriptionEvent1 = createEventData({
      description: '이벤트 1',
      date,
    });
    const descriptionEvent2 = createEventData({
      description: '이벤트 2',
      date,
    });
    const descriptionEvent3 = createEventData({
      description: '이벤트 3',
      date,
    });

    expect(
      getFilteredEvents(
        [descriptionEvent1, descriptionEvent2, descriptionEvent3],
        '이벤트 2',
        new Date(date),
        'week'
      )
    ).toEqual([descriptionEvent2]);

    // location 검색
    const locationEvent1 = createEventData({
      location: '이벤트 1',
      date,
    });
    const locationEvent2 = createEventData({
      location: '이벤트 2',
      date,
    });
    const locationEvent3 = createEventData({
      location: '이벤트 3',
      date,
    });

    expect(
      getFilteredEvents(
        [locationEvent1, locationEvent2, locationEvent3],
        '이벤트 2',
        new Date(date),
        'week'
      )
    ).toEqual([locationEvent2]);
  });

  it('주간 뷰에서 해당 주의 이벤트만 반환한다', () => {
    const date = '2025-07-01';
    const specificWeekEvents: Event[] = [
      { date: '2025-06-29' },
      { date: '2025-06-30' },
      { date: '2025-07-01' },
      { date: '2025-07-02' },
      { date: '2025-07-03' },
      { date: '2025-07-04' },
      { date: '2025-07-05' },
    ].map(createEventData);
    const events: Event[] = [
      createEventData({ date: '2025-06-28' }),
      ...specificWeekEvents,
      createEventData({ date: '2025-07-06' }),
    ];

    expect(getFilteredEvents(events, '', new Date(date), 'week')).toEqual(specificWeekEvents);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const date = '2025-07-01';
    const specificMonthEvents: Event[] = [
      { date: '2025-07-01' },
      { date: '2025-07-02' },
      { date: '2025-07-03' },
      { date: '2025-07-04' },
      { date: '2025-07-05' },
      { date: '2025-07-06' },
      { date: '2025-07-07' },
      { date: '2025-07-08' },
      { date: '2025-07-09' },
      { date: '2025-07-10' },
      { date: '2025-07-11' },
      { date: '2025-07-12' },
      { date: '2025-07-13' },
      { date: '2025-07-14' },
      { date: '2025-07-15' },
      { date: '2025-07-16' },
      { date: '2025-07-17' },
      { date: '2025-07-18' },
      { date: '2025-07-19' },
      { date: '2025-07-20' },
      { date: '2025-07-21' },
      { date: '2025-07-22' },
      { date: '2025-07-23' },
      { date: '2025-07-24' },
      { date: '2025-07-25' },
      { date: '2025-07-26' },
      { date: '2025-07-27' },
      { date: '2025-07-28' },
      { date: '2025-07-29' },
      { date: '2025-07-30' },
      { date: '2025-07-31' },
    ].map(createEventData);
    const events: Event[] = [
      createEventData({ date: '2025-06-30' }),
      ...specificMonthEvents,
      createEventData({ date: '2025-08-01' }),
    ];

    expect(getFilteredEvents(events, '', new Date(date), 'month')).toEqual(specificMonthEvents);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const date = '2025-07-01';
    const specificEvents: Event[] = [
      { date: '2025-06-29', location: '이벤트' },
      { date: '2025-06-30', description: '이벤트' },
      { date: '2025-07-01', title: '이벤트' },
    ].map(createEventData);
    const events: Event[] = [
      createEventData({ date: '2025-06-28' }),
      ...specificEvents,
      createEventData({ date: '2025-07-02' }),
      createEventData({ date: '2025-07-03' }),
      createEventData({ date: '2025-07-04' }),
      createEventData({ date: '2025-07-05' }),
      createEventData({ date: '2025-07-06' }),
    ];

    expect(getFilteredEvents(events, '이벤트', new Date(date), 'week')).toEqual(specificEvents);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const date = '2025-07-01';
    const events: Event[] = [
      createEventData({ date: '2025-06-29' }),
      createEventData({ date: '2025-06-30' }),
      createEventData({ date: '2025-07-01' }),
    ];
    expect(getFilteredEvents(events, '', new Date(date), 'week')).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const date = '2025-07-01';
    const events: Event[] = [
      createEventData({ date: '2025-06-29', title: 'KEYWORD' }),
      createEventData({ date: '2025-06-30', title: 'keyword' }),
      createEventData({ date: '2025-07-01', title: 'KEYWORD' }),
    ];
    expect(getFilteredEvents(events, 'keyword', new Date(date), 'week')).toEqual(events);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const date = '2025-07-01';
    const outOfMonthEvents: Event[] = [
      createEventData({ date: '2025-06-30' }),
      createEventData({ date: '2025-08-01' }),
    ];
    const specificEvents: Event[] = [
      createEventData({ date: '2025-07-01' }),
      createEventData({ date: '2025-07-31' }),
    ];
    expect(
      getFilteredEvents([...outOfMonthEvents, ...specificEvents], '', new Date(date), 'month')
    ).toEqual(specificEvents);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const date = '2025-07-01';
    expect(getFilteredEvents([], '', new Date(date), 'month')).toEqual([]);
  });
});
