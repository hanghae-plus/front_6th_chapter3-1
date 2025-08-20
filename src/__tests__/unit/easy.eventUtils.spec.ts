import { getFilteredEvents } from '../../utils/eventUtils';
import { createMockEvent } from '../utils';

describe('getFilteredEvents: 검색된 이벤트를 주간 뷰 또는 월간 뷰에 맞게 필터링', () => {
  const events = [
    createMockEvent(1, {
      date: '2025-07-01',
      title: '이벤트 1',
      startTime: '07:00',
      endTime: '08:00',
    }),
    createMockEvent(2, {
      date: '2025-07-12',
      title: '이벤트 2',
      startTime: '12:00',
      endTime: '13:00',
    }),
    createMockEvent(3, {
      date: '2025-07-31',
      title: 'EVENT 3',
      startTime: '09:00',
      endTime: '10:00',
    }),
    createMockEvent(4, {
      date: '2025-08-01',
      title: 'EVENT 4',
      startTime: '09:00',
      endTime: '10:00',
    }),
  ];

  describe('검색 기능 테스트', () => {
    it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
      const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'month');
      expect(result.map((e) => e.title)).toEqual(['이벤트 2']);
    });

    it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
      const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
      expect(result).toHaveLength(3);
    });

    it('검색어는 대소문자를 구분하지 않고 작동한다', () => {
      const result = getFilteredEvents(events, 'event', new Date('2025-07-01'), 'month');
      expect(result.map((e) => e.title)).toEqual(['EVENT 3']);
    });

    it('해당 검색어에 대한 결과가 없으면 빈 배열을 반환한다', () => {
      const result = getFilteredEvents(events, '검색어', new Date('2025-07-01'), 'month');
      expect(result).toEqual([]);
    });
  });

  describe('주간 뷰 테스트', () => {
    it('2025-07-01 속한 주의 이벤트만 반환한다', () => {
      const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');
      expect(result.map((e) => e.id)).toEqual(['1']);
    });

    it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
      const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');
      expect(result.map((e) => e.id)).toEqual(['1']);
    });

    it('주의 경계(2025-06-29 ~ 2025-07-05)에 있는 이벤트를 올바르게 필터링한다', () => {
      const boundaryEvents = [
        createMockEvent(1, { date: '2025-06-29' }),
        createMockEvent(2, { date: '2025-07-05' }),
      ];

      const result = getFilteredEvents(boundaryEvents, '', new Date('2025-07-01'), 'week');
      expect(result).toHaveLength(2);
    });
  });

  describe('월간 뷰 테스트', () => {
    it('2025년 7월의 모든 이벤트를 반환한다', () => {
      const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');
      expect(result.map((e) => e.id)).toEqual(['1', '2', '3']);
    });

    it("검색어 '이벤트'와 월간 뷰 필터링을 동시에 적용한다", () => {
      const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'month');
      expect(result.map((e) => e.id)).toEqual(['1', '2']);
    });

    it('월의 초(2025-07-01)와 말일(2025-07-31)의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
      const boundaryEvents = [
        createMockEvent(1, { date: '2025-07-01' }),
        createMockEvent(2, { date: '2025-07-31' }),
      ];

      const result = getFilteredEvents(boundaryEvents, '', new Date('2025-07-15'), 'month');
      expect(result).toHaveLength(2);
    });
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '검색어', new Date('2025-07-01'), 'week');
    expect(result).toEqual([]);
  });
});
