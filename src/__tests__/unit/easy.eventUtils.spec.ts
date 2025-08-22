import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '주간 이벤트 1',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 회의',
    location: '회의실',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '월간 이벤트 2',
    date: '2025-07-15',
    startTime: '14:00',
    endTime: '15:00',
    description: '월간 보고 monthly event',
    location: '온라인',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '다른 주 이벤트',
    date: '2025-07-08',
    startTime: '10:00',
    endTime: '11:00',
    description: '다른 회의',
    location: '회의실',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '다른 월 이벤트',
    date: '2025-08-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '8월 회의',
    location: '회의실',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '5',
    title: '월말 이벤트',
    date: '2025-07-31',
    startTime: '18:00',
    endTime: '19:00',
    description: '월말 회고',
    location: '온라인',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
];

describe('getFilteredEvents', () => {
  const currentDate = new Date('2025-07-01');

  it("검색어 '월간'에 맞는 이벤트만 반환한다", () => {
    const filtered = getFilteredEvents(mockEvents, '월간', currentDate, 'month');
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('월간 이벤트 2');
  });

  it('주간 뷰에서 2025-07-01이 속한 주의 이벤트만 반환한다', () => {
    const filtered = getFilteredEvents(mockEvents, '', currentDate, 'week');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('1');
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const filtered = getFilteredEvents(mockEvents, '', currentDate, 'month');
    expect(filtered.length).toBe(4);
    const eventIds = filtered.map((e) => e.id).sort();
    expect(eventIds).toEqual(['1', '2', '3', '5']);
  });

  it("검색어 '회의'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const dateForWeek = new Date('2025-07-08');
    const filtered = getFilteredEvents(mockEvents, '회의', dateForWeek, 'week');
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('다른 주 이벤트');
  });

  it('검색어가 없을 때 해당 월의 모든 이벤트를 반환한다', () => {
    const filtered = getFilteredEvents(mockEvents, '', currentDate, 'month');
    expect(filtered.length).toBe(4);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const filtered = getFilteredEvents(
      mockEvents,
      'MONTHLY EVENT',
      new Date('2025-07-15'),
      'month'
    );
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('월간 이벤트 2');
  });

  it('월의 경계(마지막 날)에 있는 이벤트를 올바르게 필터링한다', () => {
    const dateAtEndOfMonth = new Date('2025-07-31');
    const filtered = getFilteredEvents(mockEvents, '', dateAtEndOfMonth, 'month');
    expect(filtered.some((e) => e.id === '5')).toBe(true);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const filtered = getFilteredEvents([], '검색', currentDate, 'month');
    expect(filtered).toEqual([]);
  });
});
