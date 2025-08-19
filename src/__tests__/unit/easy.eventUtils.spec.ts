import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { mock20250701WeekData, mockEvents } from '../test-data';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const events = mockEvents;
    const currentDate = new Date('2025-08-01');
    const result = getFilteredEvents(events, '이벤트 2', currentDate, 'week');
    expect(result).toEqual([]);

    const result2 = getFilteredEvents(events, '이벤트 2', currentDate, 'month');
    expect(result2).toEqual([events[1]]);

    const result3 = getFilteredEvents(events, '이벤트 2', currentDate, 'week');
    expect(result3).toEqual([events[2]]);
  });

  it('주간 뷰에서 2025-07-01주의 이벤트만 반환한다', () => {
    const events = mock20250701WeekData;
    const currentDate = new Date('2025-07-01');
    const result = getFilteredEvents(events, '', currentDate, 'week');
    // 2025-07-01이 화요일이므로 해당 주는 2025-06-29(일) ~ 2025-07-05(토)
    // 2025-07-06 이상인 날짜의 이벤트는 모두 제외되어야 함
    expect(result).toEqual(
      mock20250701WeekData.filter((event) => {
        const eventDate = new Date(event.date);
        const weekStart = new Date('2025-06-29');
        const weekEnd = new Date('2025-07-05');
        return eventDate >= weekStart && eventDate <= weekEnd;
      })
    );
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const events = mock20250701WeekData;
    const currentDate = new Date('2025-07-01');
    const result = getFilteredEvents(events, '', currentDate, 'month');
    expect(result).toEqual(
      mock20250701WeekData.filter((event) => {
        const eventDate = new Date(event.date);
        const monthStart = new Date('2025-07-01');
        const monthEnd = new Date('2025-07-31');
        return eventDate >= monthStart && eventDate <= monthEnd;
      })
    );
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {});

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const events = mock20250701WeekData;
    const currentDate = new Date('2025-07-01');

    const result = getFilteredEvents(events, '', currentDate, 'month');
    expect(result).toEqual(events);

    const result2 = getFilteredEvents(events, '', currentDate, 'week');
    expect(result2).toEqual(events);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const events = mock20250701WeekData;
    const currentDate = new Date('2025-07-01');

    const result = getFilteredEvents(events, 'content', currentDate, 'month');
    expect(result).toEqual([events[1]]);

    const result2 = getFilteredEvents(events, 'content', currentDate, 'week');
    expect(result2).toEqual([events[1]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {});

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const currentDate = new Date('2025-07-01');

    const result = getFilteredEvents([], 'content', currentDate, 'month');
    expect(result).toEqual([]);

    const result2 = getFilteredEvents([], 'content', currentDate, 'week');
    expect(result2).toEqual([]);
  });
});
