import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '[team] 팀 회의',
      date: '2025-07-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '2',
      title: '[personal] 점심 약속',
      date: '2025-07-21',
      startTime: '12:30',
      endTime: '13:30',
      description: '동료와 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '3',
      title: '[team] 프로젝트 마감',
      date: '2025-08-25',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '4',
      title: '[personal] 생일 파티',
      date: '2025-08-28',
      startTime: '19:00',
      endTime: '22:00',
      description: '친구 생일 축하',
      location: '친구 집',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '5',
      title: '[personal] 휴가1',
      date: '2025-07-02',
      startTime: '17:12',
      endTime: '17:13',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '6',
      title: '[personal] 휴가2',
      date: '2025-07-03',
      startTime: '17:12',
      endTime: '17:13',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '7',
      title: '[personal] 이벤트 1',
      date: '2025-08-14',
      startTime: '17:16',
      endTime: '17:21',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '8',
      title: '[personal] 이벤트 2',
      date: '2025-08-16',
      startTime: '17:16',
      endTime: '17:21',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '9',
      title: '[team] 프로젝트 마감',
      date: '2025-09-30',
      startTime: '17:16',
      endTime: '17:21',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '10',
      title: '[team] 프로젝트 배포',
      date: '2025-10-01',
      startTime: '17:16',
      endTime: '17:21',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    expect(getFilteredEvents(events, '이벤트 2', new Date('2025-08-16'), 'week')).toEqual([
      {
        id: '8',
        title: '[personal] 이벤트 2',
        date: '2025-08-16',
        startTime: '17:16',
        endTime: '17:21',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ]);
    expect(getFilteredEvents(events, '이벤트 2', new Date('2025-08-28'), 'month')).toEqual([
      {
        id: '8',
        title: '[personal] 이벤트 2',
        date: '2025-08-16',
        startTime: '17:16',
        endTime: '17:21',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'week')).toEqual([
      {
        id: '5',
        title: '[personal] 휴가1',
        date: '2025-07-02',
        startTime: '17:12',
        endTime: '17:13',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '6',
        title: '[personal] 휴가2',
        date: '2025-07-03',
        startTime: '17:12',
        endTime: '17:13',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date('2025-07-01'), 'month')).toEqual([
      {
        id: '1',
        title: '[team] 팀 회의',
        date: '2025-07-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '[personal] 점심 약속',
        date: '2025-07-21',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '5',
        title: '[personal] 휴가1',
        date: '2025-07-02',
        startTime: '17:12',
        endTime: '17:13',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '6',
        title: '[personal] 휴가2',
        date: '2025-07-03',
        startTime: '17:12',
        endTime: '17:13',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    expect(getFilteredEvents(events, '이벤트', new Date('2025-08-12'), 'week')).toEqual([
      {
        id: '7',
        title: '[personal] 이벤트 1',
        date: '2025-08-14',
        startTime: '17:16',
        endTime: '17:21',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '8',
        title: '[personal] 이벤트 2',
        date: '2025-08-16',
        startTime: '17:16',
        endTime: '17:21',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date('2025-07-12'), 'month')).toEqual([
      {
        id: '1',
        title: '[team] 팀 회의',
        date: '2025-07-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '2',
        title: '[personal] 점심 약속',
        date: '2025-07-21',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '5',
        title: '[personal] 휴가1',
        date: '2025-07-02',
        startTime: '17:12',
        endTime: '17:13',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '6',
        title: '[personal] 휴가2',
        date: '2025-07-03',
        startTime: '17:12',
        endTime: '17:13',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    expect(getFilteredEvents(events, 'TEAM', new Date('2025-07-12'), 'month')).toEqual([
      {
        id: '1',
        title: '[team] 팀 회의',
        date: '2025-07-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    expect(getFilteredEvents(events, '', new Date('2025-09-30'), 'week')).toEqual([
      {
        id: '9',
        title: '[team] 프로젝트 마감',
        date: '2025-09-30',
        startTime: '17:16',
        endTime: '17:21',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '10',
        title: '[team] 프로젝트 배포',
        date: '2025-10-01',
        startTime: '17:16',
        endTime: '17:21',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    expect(getFilteredEvents([], 'TEAM', new Date('2025-07-12'), 'month')).toEqual([]);
  });
});
