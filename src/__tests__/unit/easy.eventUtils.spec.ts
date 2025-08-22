import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { createEvents } from '../eventFactory';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events = createEvents([
      { date: '2025-07-01', title: '이벤트 1 제목' }, // 불일치
      { date: '2025-07-01', title: '이벤트 2 제목' }, // 일치
      { date: '2025-07-01', location: '이벤트 2 장소' }, // 일치
      { date: '2025-07-01', description: '이벤트 2 설명' }, // 일치
    ]);

    const expected: Event[] = [events[1], events[2], events[3]];

    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'week');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(3);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const events = createEvents([
      { date: '2025-07-01' },
      { date: '2025-07-01' },
      { date: '2025-07-08' },
    ]);

    const expected: Event[] = [events[0], events[1]];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(2);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const events = createEvents([
      { date: '2025-07-01' },
      { date: '2025-07-01' },
      { date: '2025-08-01' },
    ]);
    const expected: Event[] = [events[0], events[1]];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(2);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events = createEvents([
      { date: '2025-07-01', title: '이벤트' },
      { date: '2025-07-01', title: '검색어 제외' },
      { date: '2025-07-08', title: '이벤트' },
    ]);

    const expected: Event[] = [events[0]];

    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(1);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events = createEvents([
      { date: '2025-07-01' },
      { date: '2025-07-01' },
      { date: '2025-07-08' },
    ]);

    const expected: Event[] = [...events];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events = createEvents([
      { date: '2025-07-01', title: 'meeting' },
      { date: '2025-07-01', title: 'Meeting' },
      { date: '2025-07-01', title: 'MEETING' },
    ]);

    const expected: Event[] = [...events];

    const result = getFilteredEvents(events, 'meeting', new Date('2025-07-01'), 'month');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(3);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events = createEvents([
      { date: '2025-07-31' },
      { date: '2025-08-01' },
      { date: '2025-08-02' },
    ]);

    const expected: Event[] = [events[1], events[2]];

    const result = getFilteredEvents(events, '', new Date('2025-08-01'), 'month');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(2);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const expected: Event[] = [];

    const result = getFilteredEvents([], '', new Date('2025-08-01'), 'month');

    expect(result).toEqual(expected);
    expect(result).toHaveLength(0);
  });
});
