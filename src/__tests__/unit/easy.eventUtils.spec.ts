import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const mockEventUtilsEvents: Event[] = [
  {
    id: '1',
    title: '이벤트 2 회의',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-07-03',
    startTime: '12:00',
    endTime: '13:00',
    description: '동료와 점심',
    location: '식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '이벤트 운동',
    date: '2025-06-30', // 이전 달
    startTime: '18:00',
    endTime: '19:00',
    description: '헬스장 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '프로젝트 마감',
    date: '2025-08-01', // 다음 달
    startTime: '14:00',
    endTime: '18:00',
    description: '프로젝트 완료',
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '5',
    title: '주간 회의',
    date: '2025-07-02', // 2025-07-01이 포함된 주
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 리뷰',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const currentDate = new Date('2025-07-10');
    const term = '이벤트 2';
    const result = getFilteredEvents(mockEventUtilsEvents, term, currentDate, 'month');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2 회의');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const currentDate = new Date('2025-07-03');
    const term = '';
    const result = getFilteredEvents(mockEventUtilsEvents, term, currentDate, 'week');

    expect(result).toHaveLength(4);
    expect(result[3].title).toBe('주간 회의');
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-07-13');
    const term = '';
    const result = getFilteredEvents(mockEventUtilsEvents, term, currentDate, 'month');

    expect(result).toHaveLength(3);
    expect(result[1].title).toBe('점심 약속');
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const currentDate = new Date('2025-07-01');
    const term = '이벤트';
    const result = getFilteredEvents(mockEventUtilsEvents, term, currentDate, 'week');

    expect(result).toHaveLength(2);
    expect(result[1].title).toBe('이벤트 운동');
  });

  it('검색어가 없을 때 해당 월에 대한 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-07-01');
    const term = '';
    const result = getFilteredEvents(mockEventUtilsEvents, term, currentDate, 'month');

    expect(result).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const currentDate = new Date('2025-07-16');
    const term = '회의실 a';
    const result = getFilteredEvents(mockEventUtilsEvents, term, currentDate, 'month');

    expect(result).toHaveLength(1);
    expect(result[0].location).toBe('회의실 A');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const currentDate = new Date('2025-07-01');
    const term = '';
    const result = getFilteredEvents(mockEventUtilsEvents, term, currentDate, 'month');

    expect(result).toHaveLength(3);
    expect(result[1].title).toBe('점심 약속');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const currentDate = new Date('2025-07-11');
    const term = '';
    const result = getFilteredEvents([], term, currentDate, 'month');

    expect(result).toHaveLength(0);
  });
});
