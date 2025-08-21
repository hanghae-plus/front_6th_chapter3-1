import { Event } from '../../types';
import {
  containsTerm,
  filterEventsByDateRange,
  filterEventsByDateRangeAtMonth,
  filterEventsByDateRangeAtWeek,
  getFilteredEvents,
  searchEvents,
} from '../../utils/eventUtils';

describe('filterEventsByDateRange', () => {
  const events: Event[] = [
    {
      id: 'a6b7c8d9-1111-2222-3333-444455556666',
      title: '디자인 QA',
      date: '2025-08-01',
      startTime: '16:00',
      endTime: '17:00',
      description: '신규 장바구니 페이지 픽셀 퍼펙트 검수',
      location: 'Figma/Jira',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '11112222-3333-4444-5555-666677778888',
      title: '코드리뷰 타임',
      date: '2025-08-22',
      startTime: '11:00',
      endTime: '11:30',
      description: 'PR #124 ~ #129 리뷰',
      location: 'GitHub PR',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 5,
    },
    {
      id: '9999aaaa-bbbb-cccc-dddd-eeeeffff0001',
      title: 'PT 상담',
      date: '2025-08-23',
      startTime: '19:30',
      endTime: '20:00',
      description: '체형 분석 및 루틴 점검',
      location: '동네 헬스장',
      category: '건강',
      repeat: { type: 'weekly', interval: 2 },
      notificationTime: 30,
    },
  ];

  it('2025-08-01 ~ 2025-08-07 사이의 이벤트만 반환한다', () => {
    expect(filterEventsByDateRange(events, new Date('2025-08-01'), new Date('2025-08-07'))).toEqual(
      [events[0]]
    );
  });

  it('범위에 포함되는 이벤트가 없으면 빈 배열을 반환한다', () => {
    expect(filterEventsByDateRange(events, new Date('2026-08-01'), new Date('2026-08-07'))).toEqual(
      []
    );
  });
});

describe('containsTerm', () => {
  it('문자열이 영어일 경우, 대소문자를 구분하지 않고 문자열을 검색한다', () => {
    expect(containsTerm('Hello World', 'hello')).toBe(true);
    expect(containsTerm('Hello World', 'hello world')).toBe(true);
    expect(containsTerm('Hello World', 'HELLO')).toBe(true);
    expect(containsTerm('Hello World', 'HELLO WORLD')).toBe(true);
    expect(containsTerm('Hello World', 'Hello World')).toBe(true);
  });

  it('문자열에 검색어가 포함되어 있으면 true를 반환한다', () => {
    expect(containsTerm('Hello World', 'world')).toBe(true);
    expect(containsTerm('Hello World', 'WORLD')).toBe(true);
    expect(containsTerm('Hello World', 'HELLO WORLD')).toBe(true);
    expect(containsTerm('Hello World', 'Hello World')).toBe(true);
  });

  it('문자열에 검색어가 포함되어 있지 않으면 false를 반환한다', () => {
    expect(containsTerm('Hello World', 'world1')).toBe(false);
    expect(containsTerm('Hello World', '헬로월드')).toBe(false);
    expect(containsTerm('Hello World', 'CODING')).toBe(false);
    expect(containsTerm('Hello World', '12345')).toBe(false);
    expect(containsTerm('Hello World', 'World Hello')).toBe(false);
  });

  it('빈 문자열을 검색하면 항상 true를 반환한다', () => {
    expect(containsTerm('Hello World', '')).toBe(true);
    expect(containsTerm('주산들', '')).toBe(true);
    expect(containsTerm('   ', '')).toBe(true);
  });
});

describe('searchEvents', () => {
  const events: Event[] = [
    {
      id: 'a6b7c8d9-1111-2222-3333-444455556666',
      title: '디자인 QA',
      date: '2025-08-01',
      startTime: '16:00',
      endTime: '17:00',
      description: '신규 장바구니 페이지 픽셀 퍼펙트 검수',
      location: 'Figma/Jira',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '11112222-3333-4444-5555-666677778888',
      title: '코드리뷰 타임',
      date: '2025-08-22',
      startTime: '11:00',
      endTime: '11:30',
      description: 'PR #124 ~ #129 리뷰',
      location: 'GitHub PR',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 5,
    },
    {
      id: '9999aaaa-bbbb-cccc-dddd-eeeeffff0001',
      title: 'PT 상담',
      date: '2025-08-23',
      startTime: '19:30',
      endTime: '20:00',
      description: '체형 분석 및 루틴 점검',
      location: '동네 헬스장',
      category: '건강',
      repeat: { type: 'weekly', interval: 2 },
      notificationTime: 30,
    },
  ];

  it('event의 title, description, location 중 하나라도 검색어가 포함된 이벤트를 반환한다', () => {
    expect(searchEvents(events, '디자인')).toEqual([events[0]]);
    expect(searchEvents(events, '픽셀 퍼펙트')).toEqual([events[0]]);
    expect(searchEvents(events, 'Figma')).toEqual([events[0]]);

    expect(searchEvents(events, '코드리뷰')).toEqual([events[1]]);
    expect(searchEvents(events, 'PR')).toEqual([events[1]]);
    expect(searchEvents(events, 'GitHub')).toEqual([events[1]]);

    expect(searchEvents(events, 'PT')).toEqual([events[2]]);
    expect(searchEvents(events, '체형')).toEqual([events[2]]);
    expect(searchEvents(events, '헬스')).toEqual([events[2]]);
  });

  it('검색어가 포함된 이벤트가 없다면 빈 배열을 반환한다', () => {
    expect(searchEvents(events, '항해')).toEqual([]);
    expect(searchEvents(events, '디1자2인')).toEqual([]);
    expect(searchEvents(events, '타임 코드리뷰')).toEqual([]);
    expect(searchEvents(events, '동네헬스장')).toEqual([]);
  });

  it('검색어가 없으면 모든 이벤트를 반환한다', () => {
    expect(searchEvents(events, '')).toEqual(events);
  });
});

describe('filterEventsByDateRangeAtWeek', () => {
  const events: Event[] = [
    {
      id: 'a6b7c8d9-1111-2222-3333-444455556666',
      title: '디자인 QA',
      date: '2025-08-01',
      startTime: '16:00',
      endTime: '17:00',
      description: '신규 장바구니 페이지 픽셀 퍼펙트 검수',
      location: 'Figma/Jira',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '11112222-3333-4444-5555-666677778888',
      title: '코드리뷰 타임',
      date: '2025-08-22',
      startTime: '11:00',
      endTime: '11:30',
      description: 'PR #124 ~ #129 리뷰',
      location: 'GitHub PR',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 5,
    },
    {
      id: '9999aaaa-bbbb-cccc-dddd-eeeeffff0001',
      title: 'PT 상담',
      date: '2025-08-23',
      startTime: '19:30',
      endTime: '20:00',
      description: '체형 분석 및 루틴 점검',
      location: '동네 헬스장',
      category: '건강',
      repeat: { type: 'weekly', interval: 2 },
      notificationTime: 30,
    },
    {
      id: '9999aaaa-bbbb-ffff-dddd-eeeeffff0002',
      title: '커피챗',
      date: '2025-08-29',
      startTime: '10:00',
      endTime: '10:30',
      description: '이력서 피드백',
      location: '카페',
      category: '건강',
      repeat: { type: 'weekly', interval: 2 },
      notificationTime: 30,
    },
  ];
  it('날짜가 해당하는 주에 있는 이벤트만 반환한다', () => {
    expect(filterEventsByDateRangeAtWeek(events, new Date('2025-08-01'))).toEqual([events[0]]);
    expect(filterEventsByDateRangeAtWeek(events, new Date('2025-08-02'))).toEqual([events[0]]);
    expect(filterEventsByDateRangeAtWeek(events, new Date('2025-08-20'))).toEqual([
      events[1],
      events[2],
    ]);
    expect(filterEventsByDateRangeAtWeek(events, new Date('2025-08-22'))).toEqual([
      events[1],
      events[2],
    ]);
    expect(filterEventsByDateRangeAtWeek(events, new Date('2025-08-27'))).toEqual([events[3]]);
    expect(filterEventsByDateRangeAtWeek(events, new Date('2025-08-29'))).toEqual([events[3]]);
  });

  it('날짜가 해당하는 주에 이벤트가 없으면 빈 배열을 반환한다', () => {
    expect(filterEventsByDateRangeAtWeek(events, new Date('2025-08-15'))).toEqual([]);
  });
});

describe('filterEventsByDateRangeAtMonth', () => {
  const events: Event[] = [
    {
      id: 'a6b7c8d9-1111-2222-3333-444455556666',
      title: '디자인 QA',
      date: '2025-08-01',
      startTime: '16:00',
      endTime: '17:00',
      description: '신규 장바구니 페이지 픽셀 퍼펙트 검수',
      location: 'Figma/Jira',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '11112222-3333-4444-5555-666677778888',
      title: '코드리뷰 타임',
      date: '2025-08-22',
      startTime: '11:00',
      endTime: '11:30',
      description: 'PR #124 ~ #129 리뷰',
      location: 'GitHub PR',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 5,
    },
    {
      id: '9999aaaa-bbbb-cccc-dddd-eeeeffff0001',
      title: 'PT 상담',
      date: '2025-09-23',
      startTime: '19:30',
      endTime: '20:00',
      description: '체형 분석 및 루틴 점검',
      location: '동네 헬스장',
      category: '건강',
      repeat: { type: 'weekly', interval: 2 },
      notificationTime: 30,
    },
    {
      id: '9999aaaa-bbbb-ffff-dddd-eeeeffff0002',
      title: '커피챗',
      date: '2025-10-29',
      startTime: '10:00',
      endTime: '10:30',
      description: '이력서 피드백',
      location: '카페',
      category: '건강',
      repeat: { type: 'weekly', interval: 2 },
      notificationTime: 30,
    },
  ];
  it('날짜가 해당하는 월에 있는 이벤트만 반환한다', () => {
    expect(filterEventsByDateRangeAtMonth(events, new Date('2025-08-01'))).toEqual([
      events[0],
      events[1],
    ]);
    expect(filterEventsByDateRangeAtMonth(events, new Date('2025-09-01'))).toEqual([events[2]]);
  });

  it('날짜가 해당하는 월에 이벤트가 없으면 빈 배열을 반환한다', () => {
    expect(filterEventsByDateRangeAtMonth(events, new Date('2025-03-01'))).toEqual([]);
  });
});

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: 'a6b7c8d9-1111-2222-3333-444455556666',
      title: '디자인 QA',
      date: '2025-07-01',
      startTime: '16:00',
      endTime: '17:00',
      description: '신규 장바구니 페이지 픽셀 퍼펙트 검수',
      location: 'Figma/Jira',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '11112222-3333-4444-5555-666677778888',
      title: '코드리뷰 타임',
      date: '2025-07-22',
      startTime: '11:00',
      endTime: '11:30',
      description: 'PR #124 ~ #129 리뷰',
      location: 'GitHub PR',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 5,
    },
    {
      id: '9999aaaa-bbbb-cccc-dddd-eeeeffff0001',
      title: 'PT 상담',
      date: '2025-09-23',
      startTime: '19:30',
      endTime: '20:00',
      description: '체형 분석 및 루틴 점검',
      location: '동네 헬스장',
      category: '건강',
      repeat: { type: 'weekly', interval: 2 },
      notificationTime: 30,
    },
    {
      id: '9999aaaa-bbbb-ffff-dddd-eeeeffff0002',
      title: '이벤트 2',
      date: '2025-10-31',
      startTime: '10:00',
      endTime: '10:30',
      description: '이벤트 2 테스트',
      location: '이벤트 장소',
      category: '건강',
      repeat: { type: 'weekly', interval: 2 },
      notificationTime: 30,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const equalDayEvents = events.map((e) => {
      return {
        ...e,
        date: '2025-10-31',
        startTime: '10:00',
        endTime: '10:30',
      };
    });
    expect(getFilteredEvents(equalDayEvents, '이벤트 2', new Date('2025-10-31'))).toEqual([
      events[3],
    ]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'week')).toEqual([events[0]]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'month')).toEqual([
      events[0],
      events[1],
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    expect(getFilteredEvents(events, '이벤트', new Date('2025-10-31'), 'week')).toEqual([
      events[3],
    ]);
  });

  // 테스트 케이스 문장 수정
  // it('검색어가 없을 때 모든 이벤트를 반환한다', () => {})
  it('검색어가 없을 때 조건에 맞는 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'month').length).toEqual(2);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    expect(getFilteredEvents(events, 'pr', new Date('2025-07-01'))).toEqual([events[1]]);
    expect(getFilteredEvents(events, 'PR', new Date('2025-07-01'))).toEqual([events[1]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    expect(getFilteredEvents(events, '', new Date('2025-10-31'), 'month').length).toEqual(1);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    expect(getFilteredEvents([], '이벤트 2', new Date('2025-10-31'))).toEqual([]);
  });
});
