import { getFilteredEvents } from '../../utils/eventUtils';
import { createTestEvents } from '../utils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'를 포함한 이벤트 배열을 반환한다", () => {
    const events = createTestEvents([
      { id: '1', title: '이벤트 1', date: '2025-07-01' },
      { id: '2', title: '이벤트 2', date: '2025-07-01' },
      { id: '3', title: '이벤트 2가 아닌 3', date: '2025-07-01' },
    ]);

    const filteredEvents = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(filteredEvents).toHaveLength(2);
    expect(filteredEvents.map((e) => e.id)).toEqual(['2', '3']);
  });

  it('주간 뷰에서 2025-07-01 주에 포함된 이벤트 배열을 모두 반환한다', () => {
    const events = createTestEvents([
      { id: '1', title: '이번 주 이벤트', date: '2025-07-01' }, // 화요일 (포함)
      { id: '2', title: '이번 주 이벤트', date: '2025-07-05' }, // 토요일 (포함)
      { id: '3', title: '다음 주 이벤트', date: '2025-07-08' }, // 다음 주 화요일 (제외)
    ]);

    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(filteredEvents).toHaveLength(2);
    expect(filteredEvents.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('월간 뷰에서 2025년 7월의 이벤트를 모두 반환한다', () => {
    const events = createTestEvents([
      { id: '1', title: '7월 이벤트', date: '2025-07-01' }, // 7월 (포함)
      { id: '2', title: '7월 이벤트', date: '2025-07-31' }, // 7월 (포함)
      { id: '3', title: '8월 이벤트', date: '2025-08-01' }, // 8월 (제외)
    ]);

    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
    expect(filteredEvents).toHaveLength(2);
    expect(filteredEvents.map((e) => e.id)).toEqual(['1', '2']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const events = createTestEvents([
      { id: '1', title: '이번 주 이벤트 1', date: '2025-07-01' },
      { id: '2', title: '이번 주 이벤트 2', date: '2025-07-05' },
      { id: '3', title: '다음 주 이벤트', date: '2025-07-08' },
    ]);

    const filteredEvents = getFilteredEvents(events, '이벤트 1', new Date('2025-07-01'), 'week');
    expect(filteredEvents).toHaveLength(1);
    expect(filteredEvents.map((e) => e.id)).toEqual(['1']);
  });

  // 위에서 검색어 없이 주간, 월간 모든 이벤트를 반환하는 테스트를 진행했으므로 의미 없는 테스트라서 skip
  it.skip('검색어가 없을 때 모든 이벤트를 반환한다', () => {});

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events = createTestEvents([
      { id: '1', title: 'event 1', date: '2025-07-01' },
      { id: '2', title: 'Event 2', date: '2025-07-01' },
    ]);

    const filteredEvents = getFilteredEvents(events, 'Event', new Date('2025-07-01'), 'week');
    expect(filteredEvents).toHaveLength(2);
    expect(filteredEvents.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const events = createTestEvents([
      { id: '1', title: '6월 마지막 날', date: '2025-06-30' },
      { id: '2', title: '7월 첫 날', date: '2025-07-01' },
      { id: '3', title: '7월 마지막 날', date: '2025-07-31' },
      { id: '4', title: '8월 첫 날', date: '2025-08-01' },
    ]);

    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-15'), 'month');
    expect(filteredEvents).toHaveLength(2);
    expect(filteredEvents.map((e) => e.id)).toEqual(['2', '3']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events = createTestEvents([{ id: '1', title: '이벤트 1', date: '2025-06-01' }]);
    const filteredEvents = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
    expect(filteredEvents).toHaveLength(0);
  });
});
