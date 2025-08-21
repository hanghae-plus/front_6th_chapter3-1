import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const dateStr = (y: number, m: number, d: number) =>
  [y, String(m + 1).padStart(2, '0'), String(d).padStart(2, '0')].join('-');

const makeEvent = (
  id: string,
  y: number,
  m: number,
  d: number,
  overrides: Partial<Event> = {}
): Event => ({
  id,
  title: id,
  date: dateStr(y, m, d),
  startTime: '09:00',
  endTime: '10:00',
  description: '',
  location: '',
  category: 'default',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 10,
  ...overrides,
});

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events: Event[] = [
      makeEvent('이벤트 1', 2025, 6, 1),
      makeEvent('이벤트 2', 2025, 6, 2),
      makeEvent('이벤트 3', 2025, 6, 3),
    ];

    const result = getFilteredEvents(events, '이벤트 2', new Date(2025, 6, 1), 'month');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const events: Event[] = [
      makeEvent('이벤트 1', 2025, 5, 28),
      makeEvent('이벤트 2', 2025, 5, 29),
      makeEvent('이벤트 3', 2025, 6, 1),
      makeEvent('이벤트 4', 2025, 6, 5),
      makeEvent('이벤트 5', 2025, 6, 6),
    ];

    const currentDate = new Date(2025, 6, 1);
    const result = getFilteredEvents(events, '', currentDate, 'week');

    const titles = result.map((e) => e.title);
    expect(titles).toEqual(['이벤트 2', '이벤트 3', '이벤트 4']);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      makeEvent('이벤트 1', 2025, 5, 30),
      makeEvent('이벤트 2', 2025, 6, 1),
      makeEvent('이벤트 3', 2025, 6, 15),
      makeEvent('이벤트 4', 2025, 6, 31),
      makeEvent('이벤트 5', 2025, 7, 1),
    ];

    const result = getFilteredEvents(events, '', new Date(2025, 6, 10), 'month');
    const titles = result.map((e) => e.title);

    expect(titles).toEqual(['이벤트 2', '이벤트 3', '이벤트 4']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events: Event[] = [
      makeEvent('이벤트 1', 2025, 5, 29),
      makeEvent('이벤트 2', 2025, 6, 1),
      makeEvent('2벤트 3', 2025, 6, 3),
      makeEvent('이벤트 4', 2025, 6, 5),
      makeEvent('이벤트 5', 2025, 6, 6),
    ];

    const result = getFilteredEvents(events, '이벤트', new Date(2025, 6, 1), 'week');
    const titles = result.map((e) => e.title);

    expect(titles).toEqual(['이벤트 1', '이벤트 2', '이벤트 4']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events: Event[] = [
      makeEvent('이벤트 1', 2025, 5, 29),
      makeEvent('이벤트 2', 2025, 6, 1),
      makeEvent('이벤트 3', 2025, 6, 5),
    ];

    const result = getFilteredEvents(events, '', new Date(2025, 6, 1), 'week');
    expect(result).toHaveLength(events.length);
    expect(result.map((e) => e.id).sort()).toEqual(events.map((e) => e.id).sort());
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events: Event[] = [
      makeEvent('Event 1', 2025, 6, 1),
      makeEvent('event 2', 2025, 6, 2),
      makeEvent('2vent 3', 2025, 6, 3),
    ];

    const result = getFilteredEvents(events, 'EVENT', new Date(2025, 6, 1), 'week');
    expect(result.map((e) => e.title)).toEqual(['Event 1', 'event 2']);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events: Event[] = [
      makeEvent('이벤트 1', 2025, 5, 30),
      makeEvent('이벤트 2', 2025, 6, 1),
      makeEvent('이벤트 3', 2025, 6, 31),
      makeEvent('이벤트 4', 2025, 7, 1),
    ];

    const result = getFilteredEvents(events, '', new Date(2025, 6, 15), 'month');
    expect(result.map((e) => e.title)).toEqual(['이벤트 2', '이벤트 3']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date(2025, 6, 1), 'week');
    expect(result).toEqual([]);
  });
});
