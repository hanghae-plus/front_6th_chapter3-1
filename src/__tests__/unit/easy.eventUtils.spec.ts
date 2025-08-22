import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2025-07-01',
      description: '첫 번째 이벤트',
      location: '서울',
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-01',
      description: '두 번째 이벤트',
      location: '부산',
    },
    {
      id: '3',
      title: '회의',
      date: '2025-07-01',
      description: '이벤트 2 관련 회의',
      location: '대구',
    },
    {
      id: '4',
      title: 'EVENT 1',
      date: '2025-07-02',
      description: 'Event 관련 회의',
      location: '광주',
    },
    {
      id: '5',
      title: '세미나',
      date: '2025-07-03',
      description: '교육 세미나',
      location: '인천',
    },
    {
      id: '6',
      title: '이벤트 3',
      date: '2025-07-07',
      description: '주말 이벤트',
      location: '울산',
    },
    {
      id: '7',
      title: '회의 2',
      date: '2025-07-08',
      description: '다음 주 회의',
      location: '대전',
    },
    {
      id: '8',
      title: '7월 마지막 이벤트',
      date: '2025-07-31',
      description: '7월 마지막 날 이벤트',
      location: '제주',
    },
    {
      id: '9',
      title: '6월 이벤트',
      date: '2025-06-30',
      description: '6월 마지막 날 이벤트',
      location: '춘천',
    },
    {
      id: '10',
      title: '8월 이벤트',
      date: '2025-08-01',
      description: '8월 첫 번째 이벤트',
      location: '강릉',
    },
  ] as Event[];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', new Date('2025-07-01'), 'month');

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('이벤트 2');
    expect(result[1].description).toContain('이벤트 2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'week');

    expect(result).toHaveLength(6);
    expect(
      result.every((event) => {
        const eventDate = new Date(event.date);
        const startOfWeek = new Date('2025-06-29');
        const endOfWeek = new Date('2025-07-05');
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      })
    ).toBe(true);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-15'), 'month');

    expect(result).toHaveLength(8);
    expect(result.every((event) => event.date.startsWith('2025-07'))).toBe(true);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트', new Date('2025-07-01'), 'week');

    expect(result).toHaveLength(4);
    expect(
      result.every(
        (event) =>
          event.title.toLowerCase().includes('이벤트') ||
          event.description.toLowerCase().includes('이벤트')
      )
    ).toBe(true);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const julyEvents = mockEvents.filter((event) => event.date.startsWith('2025-07'));
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');

    expect(result).toHaveLength(8);
    expect(result).toEqual(julyEvents);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(mockEvents, 'event', new Date('2025-07-01'), 'month');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('EVENT 1');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-15'), 'month');
    const julyEvents = result.filter((event) => event.date.startsWith('2025-07'));

    expect(julyEvents).toHaveLength(8);
    expect(julyEvents.some((event) => event.date === '2025-07-01')).toBe(true);
    expect(julyEvents.some((event) => event.date === '2025-07-31')).toBe(true);
    expect(
      julyEvents.every(
        (event) => !event.date.startsWith('2025-06') && !event.date.startsWith('2025-08')
      )
    ).toBe(true);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const emptyEvents: Event[] = [];
    const result = getFilteredEvents(emptyEvents, '이벤트', new Date('2025-07-01'), 'month');

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});
