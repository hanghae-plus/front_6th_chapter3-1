import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { getWeekDates } from '../../utils/dateUtils';

const generateMockEvent = (id: string, title: string, date: string): Event => ({
  id,
  title,
  date,
  description: `${title} 설명`,
  location: '서울시',
  startTime: '10:00',
  endTime: '11:00',
  category: '업무',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 10,
});

const mockEvents: Event[] = [
  generateMockEvent('1', '이벤트 1', '2025-07-01'), // 화요일
  generateMockEvent('2', '이벤트 2', '2025-07-02'), // 수요일
  generateMockEvent('3', '팀 회의', '2025-07-03'), // 목요일
  generateMockEvent('4', '점심 약속', '2025-07-10'), // 목요일
  generateMockEvent('5', '개인 프로젝트', '2025-07-15'), // 화요일
  generateMockEvent('6', '주간 회의', '2025-07-31'), // 목요일
  generateMockEvent('7', '월간 회의', '2025-08-01'), // 금요일 (다음 달)
  generateMockEvent('8', '휴가', '2025-06-30'), // 월요일 (이전 달)
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', new Date('2025-07-01'), 'month');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const currentDate = new Date('2025-07-01'); // 화요일
    const result = getFilteredEvents(mockEvents, '', currentDate, 'week');

    // 2025-07-01 주의 이벤트 : 6/29(일) ~ 7/5(토)
    const weekDates = getWeekDates(currentDate);
    const expectedStartDate = weekDates[0]; // 일요일
    const expectedEndDate = weekDates[6]; // 토요일

    result.forEach((event) => {
      const eventDate = new Date(event.date);
      expect(eventDate >= expectedStartDate && eventDate <= expectedEndDate).toBe(true);
    });

    const titles = result.map((event) => event.title);
    expect(titles).toContain('이벤트 1');
    expect(titles).toContain('이벤트 2');
    expect(titles).toContain('팀 회의');
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-07-15');
    const result = getFilteredEvents(mockEvents, '', currentDate, 'month');

    // 2025년 7월의 이벤트들만 반환되어야 함
    expect(result).toHaveLength(6); // 7월 이벤트 6개

    result.forEach((event) => {
      const eventDate = new Date(event.date);
      expect(eventDate.getFullYear()).toBe(2025);
      expect(eventDate.getMonth()).toBe(6);
    });

    const titles = result.map((event) => event.title);
    expect(titles).toContain('이벤트 1');
    expect(titles).toContain('이벤트 2');
    expect(titles).toContain('팀 회의');
    expect(titles).toContain('점심 약속');
    expect(titles).toContain('개인 프로젝트');
    expect(titles).toContain('주간 회의');
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const currentDate = new Date('2025-07-01'); // 화요일
    const result = getFilteredEvents(mockEvents, '이벤트', currentDate, 'week');

    const titles = result.map((event) => event.title);
    expect(titles).toContain('이벤트 1');
    expect(titles).toContain('이벤트 2');

    const weekDates = getWeekDates(currentDate);
    result.forEach((event) => {
      const eventDate = new Date(event.date);
      expect(eventDate >= weekDates[0] && eventDate <= weekDates[6]).toBe(true);
    });
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-07-15');
    const result = getFilteredEvents(mockEvents, '', currentDate, 'month');

    expect(result).toHaveLength(6);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const currentDate = new Date('2025-07-15');
    const keywords = ['이벤트', '이벤트', '팀 회의', '팀 회의'];

    keywords.forEach((searchTerm) => {
      const events = getFilteredEvents(mockEvents, searchTerm, currentDate, 'month');
      expect(events.length).toBeGreaterThan(0);
    });

    const result = getFilteredEvents(mockEvents, '회의', currentDate, 'month');
    expect(result).toHaveLength(2);

    const titles = result.map((event) => event.title);
    expect(titles).toContain('팀 회의');
    expect(titles).toContain('주간 회의');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const currentDate = new Date('2025-07-15');
    const result = getFilteredEvents(mockEvents, '', currentDate, 'month');

    const dates = result.map((event) => new Date(event.date).getDate());
    expect(dates).toContain(1); // 7월 1일
    expect(dates).toContain(31); // 7월 31일

    const titles = result.map((event) => event.title);
    expect(titles).not.toContain('휴가'); // 6월 30일
    expect(titles).not.toContain('월간 회의'); // 8월 1일
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const emptyEvents: Event[] = [];
    const currentDate = new Date('2025-07-15');

    const weekResult = getFilteredEvents(emptyEvents, '개발자', currentDate, 'week');
    expect(weekResult).toEqual([]);

    const monthResult = getFilteredEvents(emptyEvents, '개발자', currentDate, 'month');
    expect(monthResult).toEqual([]);
  });
});
