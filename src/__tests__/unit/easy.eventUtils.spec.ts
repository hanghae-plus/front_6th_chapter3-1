import { Event } from '../../types';
import {
  getFilteredEvents,
} from '../../utils/eventUtils';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의 이벤트',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '주간 팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '프로젝트 발표 이벤트 2',
    date: '2025-07-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '신규 프로젝트 발표',
    location: '대강당',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '개인 약속',
    date: '2025-07-05',
    startTime: '18:00',
    endTime: '19:00',
    description: '친구와 저녁 식사',
    location: '강남역',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '월간 보고서 작성',
    date: '2025-07-15',
    startTime: '10:00',
    endTime: '12:00',
    description: '7월 월간 보고서',
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '5',
    title: '운동',
    date: '2025-07-20',
    startTime: '07:00',
    endTime: '08:00',
    description: '아침 조깅',
    location: '공원',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '6',
    title: '8월 이벤트 기획',
    date: '2025-08-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '다음 달 행사 준비',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'week');
    expect(result).toHaveLength(3);
    expect(result.map(e => e.id)).toEqual(expect.arrayContaining(['1', '2', '3']));
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-10'), 'month');
    expect(result).toHaveLength(5);
    expect(result.map(e => e.id)).toEqual(expect.arrayContaining(['1', '2', '3', '4', '5']));
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트', new Date('2025-07-01'), 'week');
    expect(result).toHaveLength(2);
    expect(result.map(e => e.id)).toEqual(expect.arrayContaining(['1', '2']));
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(5);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(mockEvents, '팀 회의', new Date('2025-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-31'), 'month');
    expect(result).toHaveLength(5);
    expect(result.map(e => e.id)).not.toContain('6');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], 'any', new Date(), 'month');
    expect(result).toHaveLength(0);
  });
});
