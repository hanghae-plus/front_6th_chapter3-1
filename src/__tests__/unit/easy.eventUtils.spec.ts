import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '회의 이벤트',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의입니다',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 1,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-07-02',
      startTime: '12:00',
      endTime: '13:00',
      description: '동료와 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 1,
    },
    {
      id: '3',
      title: '프로젝트 이벤트',
      date: '2025-07-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 리뷰',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 1,
    },
    {
      id: '4',
      title: '저녁 모임',
      date: '2025-07-16',
      startTime: '18:00',
      endTime: '20:00',
      description: '팀 저녁 모임1',
      location: '레스토랑',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 1,
    },
    {
      id: '5',
      title: '워크샵',
      date: '2025-08-01',
      startTime: '10:00',
      endTime: '17:00',
      description: '기술 워크샵 이벤트',
      location: '교육센터',
      category: '기타',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 1,
    },
    {
      id: '6',
      title: '저녁 모임',
      date: '2025-06-30',
      startTime: '18:00',
      endTime: '20:00',
      description: '팀 저녁 모임2',
      location: '레스토랑',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 1,
    },
  ];

  it('현재 날짜 기준의 월 이벤트 중 검색한 타이틀에 맞는 이벤트만 반환한다', () => {
    // 7월에 모임이 1개 있는지 확인
    const currentDate = new Date('2025-07-14');
    const result = getFilteredEvents(mockEvents, '모임', currentDate, 'month');

    expect(result).toHaveLength(1);
    expect(result).toEqual([
      {
        category: '개인',
        date: '2025-07-16',
        description: '팀 저녁 모임1',
        endTime: '20:00',
        id: '4',
        location: '레스토랑',
        notificationTime: 1,
        repeat: {
          interval: 1,
          type: 'none',
        },
        startTime: '18:00',
        title: '저녁 모임',
      },
    ]);
  });

  it('현재 날짜 기준의 일주일 이벤트 중 검색한 타이틀에 맞는 이벤트만 반환한다', () => {
    // 7월 14일 기준 모임이 1개 있는지 확인
    const targetDate1 = new Date('2025-07-14');
    const result1 = getFilteredEvents(mockEvents, '모임', targetDate1, 'week');
    expect(result1).toHaveLength(1);
    expect(result1[0].title).toContain('모임');
    expect(result1[0].title).not.toContain('워크샵');

    // 7월 31일 기준 모임이 0개 있는지 확인
    const targetDate2 = new Date('2025-07-31');
    const result2 = getFilteredEvents(mockEvents, '모임', targetDate2, 'week');
    expect(result2).toHaveLength(0);
  });

  it('주간 뷰에서 검색어가 없을 때 2025-07-01 날짜가 속해있는 일주일의 이벤트만 반환한다', () => {
    const currentDate = new Date('2025-07-01');

    const result = getFilteredEvents(mockEvents, '', currentDate, 'week');

    expect(result).toHaveLength(3);

    const eventIds = result.map((event) => event.id);
    expect(eventIds).toContain('1');
    expect(eventIds).toContain('2');
    expect(eventIds).toContain('6');
    expect(eventIds).not.toContain('3');
    expect(eventIds).not.toContain('4');
    expect(eventIds).not.toContain('5');
  });

  it('월간 뷰에서 검색어가 없을 때 2025년 7월의 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-07-15');
    const result = getFilteredEvents(mockEvents, '', currentDate, 'month');

    expect(result).toHaveLength(4);
    result.forEach((event) => {
      expect(event.date).toContain('2025-07');
    });
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    // 7월 1일이 해당되는 주에 이벤트가 있는지 확인
    const currentDate = new Date('2025-07-01');
    const result = getFilteredEvents(mockEvents, '이벤트', currentDate, 'week');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].title).toContain('이벤트');
    expect(result[0].title).not.toContain('워크샵');
  });

  // 상위의 주간 뷰, 월간 뷰 테스트와 동일하여 삭제
  // it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
  //   const currentDate = new Date('2025-07-01');

  //   const result = getFilteredEvents(mockEvents, '', currentDate, 'week');

  //   expect(result).toHaveLength(3);

  //   const eventIds = result.map((event) => event.id);
  //   expect(eventIds).toContain('1');
  //   expect(eventIds).toContain('2');
  //   expect(eventIds).toContain('6');
  //   expect(eventIds).not.toContain('3');
  //   expect(eventIds).not.toContain('4');
  //   expect(eventIds).not.toContain('5');
  // });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const testCase = ['a', 'A'];
    const currentDate = new Date('2025-07-01');
    testCase.forEach((test) => {
      const result = getFilteredEvents(mockEvents, test, currentDate, 'month');
      // 'a', 'A'로 검색시 모두 '1'을 id로 하는 이벤트를 찾는다.
      expect(result.some((event) => event.id === '1')).toBe(true);
    });
  });

  it('월의 끝과 시작의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const targetDate1 = new Date('2025-06-30');
    const targetDate2 = new Date('2025-07-01');

    // 6월 이벤트 1개만 있는지 확인
    const result1 = getFilteredEvents(mockEvents, '', targetDate1, 'month');
    expect(result1).toHaveLength(1);
    expect(result1[0].id).toBe('6');

    // 7월 이벤트 4개 있는지 확인
    const result2 = getFilteredEvents(mockEvents, '', targetDate2, 'month');
    expect(result2).toHaveLength(4);
    result2.forEach((event) => {
      expect(event.date).toContain('2025-07');
    });
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const emptyEvents: Event[] = [];
    const viewFilter: Array<'month' | 'week'> = ['month', 'week'];

    const targetDate = new Date('2025-07-01');

    viewFilter.forEach((view) => {
      // 검색어가 없음
      const result1 = getFilteredEvents(emptyEvents, '', targetDate, view);
      expect(result1).toHaveLength(0);
      expect(result1).toEqual([]);

      // 검색어가 있음
      const result2 = getFilteredEvents(emptyEvents, '모임', targetDate, view);
      expect(result2).toHaveLength(0);
      expect(result2).toEqual([]);
    });
  });
});
