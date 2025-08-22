import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

beforeEach(() => {
  process.env.TZ = 'Asia/Seoul';
});

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30') instanceof Date).toBe(true);
    expect(parseDateTime('2025-07-01', '14:30').toISOString()).toBe('2025-07-01T05:30:00.000Z');
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-13-01', '14:30').toString()).toBe('Invalid Date');
    expect(parseDateTime('2025-12-99', '14:30').toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-01', '25:61').toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '14:30').toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  const event: Event = {
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
  };

  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(event);
    expect(result.start instanceof Date).toBe(true);
    expect(result.end instanceof Date).toBe(true);

    expect(result.start.toISOString()).toBe('2025-08-01T07:00:00.000Z');
    expect(result.end.toISOString()).toBe('2025-08-01T08:00:00.000Z');
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({ ...event, date: '2025-13-01' });
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({ ...event, startTime: '25:61', endTime: '30:62' });
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
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
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(
      isOverlapping(events[0], {
        ...events[1],
        date: events[0].date,
        startTime: events[0].startTime,
        endTime: events[0].endTime,
      })
    ).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    expect(isOverlapping(events[0], events[1])).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
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
      date: '2025-08-22',
      startTime: '19:30',
      endTime: '20:00',
      description: '체형 분석 및 루틴 점검',
      location: '동네 헬스장',
      category: '건강',
      repeat: { type: 'weekly', interval: 2 },
      notificationTime: 30,
    },
  ];
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    expect(
      findOverlappingEvents(
        {
          id: '9999ffff-gggg-cccc-dddd-eeeeffff0001',
          title: '커피챗',
          date: '2025-08-22',
          startTime: '10:30',
          endTime: '21:00',
          description: '이력서 피드백',
          location: '스타벅스 강남역점',
          category: '개인',
          repeat: { type: 'weekly', interval: 2 },
          notificationTime: 30,
        },
        [events[1], events[2]]
      )
    ).toEqual([events[1], events[2]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    expect(
      findOverlappingEvents(
        {
          id: '9999ffff-gggg-cccc-dddd-eeeeffff0001',
          title: '맛집 투어',
          date: '2028-08-08',
          startTime: '10:30',
          endTime: '21:00',
          description: '언젠간 맛집 투어',
          location: '서울',
          category: '개인',
          repeat: { type: 'weekly', interval: 2 },
          notificationTime: 30,
        },
        []
      )
    ).toEqual([]);
  });
});
