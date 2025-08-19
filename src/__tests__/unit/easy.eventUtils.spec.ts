import { getFilteredEvents } from '../../utils/eventUtils';
import { createEvent } from '../utils';

describe('getFilteredEvents', () => {
  const monthEvents = [
    createEvent({
      id: '1',
      date: '2025-07-01',
      title: 'event 1',
    }),
    createEvent({
      id: '2',
      date: '2025-07-02',
      title: '이벤트 2',
    }),
    createEvent({
      id: '3',
      date: '2025-07-13',
      title: 'EVENT 3',
    }),
    createEvent({
      id: '4',
      date: '2025-07-24',
      title: '이벤트 4',
    }),
    createEvent({
      id: '5',
      date: '2025-07-31',
      title: 'Event5',
    }),
  ];

  const currentDate = new Date('2025-07-02');

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const searchTerm = '이벤트 2';

    expect(getFilteredEvents(monthEvents, searchTerm, currentDate, 'month')).toEqual([
      monthEvents[1],
    ]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    expect(getFilteredEvents(monthEvents, '', currentDate, 'week')).toEqual([
      monthEvents[0],
      monthEvents[1],
    ]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(monthEvents, '', new Date('2025-07-02'), 'month')).toEqual(
      monthEvents
    );
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const searchTerm = '이벤트';

    expect(getFilteredEvents(monthEvents, searchTerm, currentDate, 'week')).toEqual([
      monthEvents[1],
    ]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(monthEvents, '', new Date('2025-07-02'), 'month')).toEqual(
      monthEvents
    );
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const searchTerm = 'event';

    expect(getFilteredEvents(monthEvents, searchTerm, new Date('2025-07-02'), 'month')).toEqual([
      monthEvents[0],
      monthEvents[2],
      monthEvents[4],
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events = [
      createEvent({
        id: '7',
        date: '2025-07-31',
        title: '7월 이벤트',
      }),
      createEvent({
        id: '8',
        date: '2025-08-01',
        title: '8월 이벤트',
      }),
    ];

    expect(getFilteredEvents(events, '', new Date('2025-07-31'), 'month')).toEqual([events[0]]);
    expect(getFilteredEvents(events, '', new Date('2025-08-01'), 'month')).toEqual([events[1]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    expect(getFilteredEvents([], '', currentDate, 'week')).toEqual([]);
  });
});
