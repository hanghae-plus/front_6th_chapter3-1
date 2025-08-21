import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const testEvents: Event[] = [
  {
    id: '1',
    title: '7월 첫 주 이벤트',
    date: '2025-07-01',
    startTime: '10:15:00',
    endTime: '11:00:00',
    notificationTime: 15,
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
  },
  {
    id: '2',
    title: '중요한 이벤트 2',
    date: '2025-07-15',
    startTime: '12:00:00',
    endTime: '13:00:00',
    notificationTime: 30,
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
  },
  {
    id: '3',
    title: '7월 마지막 이벤트',
    date: '2025-07-31',
    startTime: '10:05:00',
    endTime: '11:00:00',
    notificationTime: 10,
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
  },
  {
    id: '4',
    title: '8월 event',
    date: '2025-08-05',
    startTime: '10:30:00',
    endTime: '11:30:00',
    notificationTime: 30,
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const date = new Date('2025-07-15');
    const filtered = getFilteredEvents(testEvents, '이벤트 2', date, 'month');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const date = new Date('2025-07-01');
    const filtered = getFilteredEvents(testEvents, '', date, 'week');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const date = new Date('2025-07-01');
    const filtered = getFilteredEvents(testEvents, '', date, 'month');
    expect(filtered).toHaveLength(3);
    expect(filtered.some((e) => e.id === '1')).toBe(true);
    expect(filtered.some((e) => e.id === '2')).toBe(true);
    expect(filtered.some((e) => e.id === '3')).toBe(true);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const date = new Date('2025-07-01');
    const filtered = getFilteredEvents(testEvents, '이벤트', date, 'week');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const date = new Date('2025-07-01');
    const filtered = getFilteredEvents(testEvents, '', date, 'month');
    expect(filtered).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const date = new Date('2025-08-01');
    const filtered = getFilteredEvents(testEvents, 'EVENT', date, 'month');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('4');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const lastDay = new Date('2025-07-31');
    const filtered = getFilteredEvents(testEvents, '', lastDay, 'month');
    expect(filtered.some((e) => e.id === '3')).toBe(true);

    const firstDay = new Date('2025-07-01');
    const filtered2 = getFilteredEvents(testEvents, '', firstDay, 'month');
    expect(filtered2.some((e) => e.id === '1')).toBe(true);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const date = new Date('2025-07-01');
    const filtered = getFilteredEvents([], '검색어', date, 'month');
    expect(filtered).toEqual([]);
  });
});
