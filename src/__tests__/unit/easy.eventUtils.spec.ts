import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Partial<Event>[] = [
    {
      id: '1',
      title: 'TitLe 1',
      date: '2025-07-02',
      startTime: '10:30',
      endTime: '11:30',
      description: 'Description 1',
      location: 'Location 1',
      category: 'Category 1',
    },
    {
      id: '2',
      title: 'titLe 2',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: 'dEscription 2',
      location: 'locaTioN 2',
      category: 'CateGory 2',
    },
    {
      id: '3',
      title: 'tiLLtLe 3',
      date: '2025-07-01',
      startTime: '14:30',
      endTime: '15:30',
      description: 'dEscription 2',
      location: 'locaTioN 2',
      category: 'CateGory 2',
    },
    {
      id: '4',
      title: '이벤트 2',
      date: '2025-06-13',
      startTime: '09:30',
      endTime: '18:30',
      description: 'dEscription 4',
      location: 'locaTioN 4',
      category: 'CateGory 42',
    },
    {
      id: '5',
      title: '이벤트 3',
      date: '2025-06-01',
      startTime: '09:30',
      endTime: '18:30',
      description: 'dEscription 4',
      location: 'locaTioN 4',
      category: 'CateGory 42',
    },
  ];
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(
      events as Event[],
      '이벤트 2',
      new Date('2025-06-13'),
      'month'
    );
    expect(result).toEqual([events[3]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events as Event[], '', new Date('2025-07-01'), 'week');
    expect(result).toEqual([events[0], events[1], events[2]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events as Event[], '', new Date('2025-07-01'), 'month');
    expect(result).toEqual([events[0], events[1], events[2]]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events as Event[], '이벤트', new Date('2025-06-01'), 'week');
    expect(result).toEqual([events[4]]);
  });

  it('검색어와 기간이 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events as Event[], '', new Date(), '');
    expect(result).toEqual(events as Event[]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events as Event[], 'TITLE', new Date('2025-07-01'), 'week');
    expect(result).toEqual([events[0], events[1]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {});

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const events: Event[] = [];
    const result = getFilteredEvents(events, '', new Date(), 'week');
    expect(result).toEqual([]);
  });
});
