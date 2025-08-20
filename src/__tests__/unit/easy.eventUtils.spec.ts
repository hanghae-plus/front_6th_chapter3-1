import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const EVENTS: Event[] = [
    {
      id: '1',
      title: '이벤트 1', // 검색어: '이벤트' / 월경계: 6월 30일 / 7월 첫째주에 포함
      date: '2025-06-30',
      startTime: '09:00',
      endTime: '10:00',
      description: '6월 마지막날 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2', // 검색어 정확히 매치
      date: '2025-07-02', // 7월 첫째주에 포함
      startTime: '10:00',
      endTime: '11:00',
      description: '7월 첫주 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-07-10', // 7월 둘째주 이므로 주간 뷰 필터링에서 제외
      startTime: '14:00',
      endTime: '15:00',
      description: '7월 두번째주 기획 회의',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '4',
      title: 'meeting with client', // 영어 대소문자 검색어 테스트
      date: '2025-07-15',
      startTime: '16:00',
      endTime: '17:00',
      description: 'Client Meeting',
      location: '회의실 D',
      category: '외부',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '5',
      title: '이벤트 5',
      date: '2025-08-01', // 8월 이므로 7월 월간 뷰에서 제외
      startTime: '10:00',
      endTime: '12:00',
      description: '8월 첫 회의',
      location: '회의실 E',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(EVENTS, '이벤트 2', new Date('2025-07-01'), 'week');
    expect(result).toEqual([EVENTS[1]]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(EVENTS, '', new Date('2025-07-01'), 'week');
    expect(result).toEqual([EVENTS[0], EVENTS[1]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(EVENTS, '', new Date('2025-07-01'), 'month');
    expect(result).toEqual([EVENTS[1], EVENTS[2], EVENTS[3]]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(EVENTS, '이벤트', new Date('2025-07-01'), 'week');
    expect(result).toEqual([EVENTS[0], EVENTS[1]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(EVENTS, '', new Date('2025-07-01'), 'week');
    expect(result).toEqual([EVENTS[0], EVENTS[1]]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(EVENTS, 'MEETING', new Date('2025-07-01'), 'month');
    expect(result).toEqual([EVENTS[3]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(EVENTS, '', new Date('2025-07-01'), 'month');
    expect(result).toEqual([EVENTS[1], EVENTS[2], EVENTS[3]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'week');
    expect(result).toEqual([]);
  });

  // 케이스 추가
  it('검색어가 어떤 이벤트와도 매칭되지 않으면 빈 배열을 반환한다', () => {
    const result = getFilteredEvents(EVENTS, '없는키워드', new Date('2025-07-01'), 'month');
    expect(result).toEqual([]);
  });
});

// QUESTION : 같은 동작을하는 코드지만 다른 테스트 케이스를 의도하고 만든거라면 따로 둬야하나? 같이 둬야하나?
