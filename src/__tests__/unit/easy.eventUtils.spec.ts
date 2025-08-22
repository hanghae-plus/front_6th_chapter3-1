import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const mockEvents: Event[] = [
  {
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '이벤트 2',
    date: '2025-08-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
    title: '점심 약속',
    date: '2025-08-21',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
    title: '프로젝트 마감',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '18:00',
    description: '분기별 프로젝트 마감',
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: 'dac62941-69e5-4ec0-98cc-24c2a79a7f81',
    title: 'SoHeE HImNae',
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
    id: '80d85368-b4a4-47b3-b959-25171d49371f',
    title: '운동',
    date: '2025-08-22',
    startTime: '18:00',
    endTime: '19:00',
    description: '주간 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', new Date('2025-08-22'), 'week');
    expect(result[0]).toEqual({
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '이벤트 2',
      date: '2025-08-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    });
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-01'), 'week');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
      title: '프로젝트 마감',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    });
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-07-15'), 'month');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
      title: '프로젝트 마감',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    });
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', new Date('2025-08-22'), 'week');
    expect(result[0]).toEqual({
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '이벤트 2',
      date: '2025-08-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    });
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-08-23'), 'week');
    expect(result).toHaveLength(3);
    expect(result).toEqual([
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '이벤트 2',
        date: '2025-08-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
        title: '점심 약속',
        date: '2025-08-21',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
      {
        id: '80d85368-b4a4-47b3-b959-25171d49371f',
        title: '운동',
        date: '2025-08-22',
        startTime: '18:00',
        endTime: '19:00',
        description: '주간 운동',
        location: '헬스장',
        category: '개인',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 1,
      },
    ]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    // 대문자로 검색
    const result1 = getFilteredEvents(mockEvents, 'SOHEE', new Date('2025-08-28'), 'week');
    expect(result1).toHaveLength(1);
    expect(result1[0].title).toBe('SoHeE HImNae');

    // 소문자로 검색
    const result2 = getFilteredEvents(mockEvents, 'sohee', new Date('2025-08-28'), 'week');
    expect(result2).toHaveLength(1);
    expect(result2[0].title).toBe('SoHeE HImNae');

    // 혼합으로 검색
    const result3 = getFilteredEvents(mockEvents, 'SoHee', new Date('2025-08-28'), 'week');
    expect(result3).toHaveLength(1);
    expect(result3[0].title).toBe('SoHeE HImNae');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-08-30'), 'week');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'dac62941-69e5-4ec0-98cc-24c2a79a7f81',
      title: 'SoHeE HImNae',
      date: '2025-08-28',
      startTime: '19:00',
      endTime: '22:00',
      description: '친구 생일 축하',
      location: '친구 집',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    });
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const emptyEvents: Event[] = [];

    const result1 = getFilteredEvents(emptyEvents, '', new Date('2025-08-22'), 'week');
    expect(result1).toEqual([]);
    expect(result1).toHaveLength(0);

    const result2 = getFilteredEvents(emptyEvents, '검색어', new Date('2025-08-22'), 'month');
    expect(result2).toEqual([]);
    expect(result2).toHaveLength(0);
  });
});
