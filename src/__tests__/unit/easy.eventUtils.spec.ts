import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { createTestEvent } from '../utils';

describe('getFilteredEvents', () => {
  it("검색어 '기존 회의'에 맞는 이벤트만 반환한다", () => {
    const events = [
      createTestEvent({ title: '기존 회의' }),
      createTestEvent({ title: '새로운 회의' }),
      createTestEvent({ title: '다른 회의' }),
    ];

    const result = getFilteredEvents(events, '기존 회의', new Date('2025-10-15'), 'week');
    const expected = [createTestEvent({ title: '기존 회의' })];

    expect(result).toEqual(expected);
  });

  it('주간 뷰에서 2025-10-15 주의 이벤트만 반환한다', () => {
    // 해당 주: 2025-10-13(일) ~ 2025-10-19(토)
    const events = [
      createTestEvent({ date: '2025-10-13' }),
      createTestEvent({ date: '2025-10-15' }),
      createTestEvent({ date: '2025-10-19' }),
      createTestEvent({ date: '2025-10-20' }),
    ];

    const result = getFilteredEvents(events, '', new Date('2025-10-15'), 'week');

    const expected = [
      createTestEvent({ date: '2025-10-13' }),
      createTestEvent({ date: '2025-10-15' }),
    ];

    expect(result).toEqual(expected);
  });

  it('월간 뷰에서 2025년 10월의 모든 이벤트를 반환한다', () => {
    const events = [
      createTestEvent({ date: '2025-10-15' }),
      createTestEvent({ date: '2025-10-20' }),
      createTestEvent({ date: '2025-11-01' }),
    ];

    const result = getFilteredEvents(events, '', new Date('2025-10-15'), 'month');

    expect(result).toEqual([
      createTestEvent({ date: '2025-10-15' }),
      createTestEvent({ date: '2025-10-20' }),
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events = [
      createTestEvent({ title: '팀 이벤트', date: '2025-10-13' }),
      createTestEvent({ title: '개인 이벤트', date: '2025-10-15' }),
      createTestEvent({ title: '회사 이벤트', date: '2025-10-16' }),
      createTestEvent({ title: '가족 이벤트', date: '2025-10-20' }),
    ];

    const result = getFilteredEvents(events, '이벤트', new Date('2025-10-15'), 'week');

    const expected = [
      createTestEvent({ title: '팀 이벤트', date: '2025-10-13' }),
      createTestEvent({ title: '개인 이벤트', date: '2025-10-15' }),
      createTestEvent({ title: '회사 이벤트', date: '2025-10-16' }),
    ];

    expect(result).toEqual(expected);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events = [
      createTestEvent({ title: '이벤트 1' }),
      createTestEvent({ title: '이벤트 2' }),
      createTestEvent({ title: '이벤트 3' }),
    ];

    const result = getFilteredEvents(events, '', new Date('2025-10-15'), 'week');

    expect(result).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events = [createTestEvent({ title: 'event' }), createTestEvent({ title: 'Event' })];

    const result = getFilteredEvents(events, 'event', new Date('2025-10-15'), 'week');

    expect(result).toEqual([
      createTestEvent({ title: 'event' }),
      createTestEvent({ title: 'Event' }),
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events = [
      createTestEvent({ date: '2025-10-31' }),
      createTestEvent({ date: '2025-11-01' }),
    ];

    const result = getFilteredEvents(events, '', new Date('2025-10-15'), 'month');
    const expected = [createTestEvent({ date: '2025-10-31' })];

    expect(result).toEqual(expected);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [];
    const result = getFilteredEvents(events, '', new Date('2025-10-15'), 'week');

    expect(result).toEqual([]);
  });
});
