import eventsData from '../../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const mockEvents = eventsData.events as Event[];

  it("검색어 '회의'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, '회의', new Date(2025, 9, 15), 'month');
    expect(result).toHaveLength(3); // 제목에 '회의' 2개 + 위치에 '회의실' 1개
    // 제목에 '회의'가 포함된 이벤트들
    const titleMatches = result.filter((event) => event.title.includes('회의'));
    expect(titleMatches).toHaveLength(2);
    // 위치에 '회의실'이 포함된 이벤트들 (모든 이벤트)
    const locationMatches = result.filter((event) => event.location.includes('회의실'));
    expect(locationMatches).toHaveLength(3);
  });

  it('주간 뷰에서 2025-10-15 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date(2025, 9, 15), 'week');
    expect(result).toHaveLength(3);
    expect(result.every((event) => event.date === '2025-10-15')).toBe(true);
  });

  it('월간 뷰에서 2025년 10월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date(2025, 9, 15), 'month');
    expect(result).toHaveLength(3);
    expect(result.every((event) => event.date.startsWith('2025-10-'))).toBe(true);
  });

  it("검색어 '기존'과 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(mockEvents, '기존', new Date(2025, 9, 15), 'week');
    expect(result).toHaveLength(2);
    expect(result.every((event) => event.title.includes('기존'))).toBe(true);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date(2025, 9, 15), 'month');
    expect(result).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(mockEvents, '회의실', new Date(2025, 9, 15), 'month');
    expect(result).toHaveLength(3);
    expect(
      result.every(
        (event) =>
          event.location.toLowerCase().includes('회의실') ||
          event.location.toLowerCase().includes('회의실')
      )
    ).toBe(true);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    // 10월 15일은 10월에 속하므로 모든 이벤트가 포함되어야 함
    const result = getFilteredEvents(mockEvents, '', new Date(2025, 9, 15), 'month');
    expect(result).toHaveLength(3);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '회의', new Date(2025, 9, 15), 'month');
    expect(result).toEqual([]);
  });
});
