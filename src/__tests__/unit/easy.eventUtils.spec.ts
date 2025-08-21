import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { createMockEvent } from '../utils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events = [
      createMockEvent(1, { title: '이벤트' }),
      createMockEvent(2, { title: '이벤트 2' }),
      createMockEvent(3, { title: '이벤트 3' }),
    ];

    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-08-01'), 'week');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const events = [
      createMockEvent(1, { date: '2025-07-01' }),
      createMockEvent(2, { date: '2025-07-02' }),
      createMockEvent(3, { date: '2025-08-03' }),
    ];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const events = [
      createMockEvent(1, { date: '2025-07-01' }),
      createMockEvent(2, { date: '2025-07-02' }),
      createMockEvent(3, { date: '2025-08-03' }),
    ];

    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events = [
      createMockEvent(1, { date: '2025-07-01' }),
      createMockEvent(2, { date: '2025-07-02' }),
      createMockEvent(3, { date: '2025-08-03' }),
    ];

    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events = [
      createMockEvent(1, { title: '이벤트' }),
      createMockEvent(2, { title: '이벤트 2' }),
      createMockEvent(3, { title: '이벤트 3' }),
    ];

    const result = getFilteredEvents(events, '', new Date('2025-08-01'), 'week');

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('3');
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events = [
      createMockEvent(1, { title: 'event' }),
      createMockEvent(2, { title: 'Event' }),
      createMockEvent(3, { title: 'EVENT' }),
    ];

    const result = getFilteredEvents(events, 'event', new Date('2025-08-01'), 'week');

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('3');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events = [
      createMockEvent(1, { date: '2025-07-31' }),
      createMockEvent(2, { date: '2025-08-01' }),
      createMockEvent(3, { date: '2025-08-02' }),
    ];

    const result = getFilteredEvents(events, '', new Date('2025-07-31'), 'month');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [];

    const result = getFilteredEvents(events, '', new Date('2025-08-01'), 'week');

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});
