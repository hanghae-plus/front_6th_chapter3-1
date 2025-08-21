import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Event 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '첫 번째 이벤트입니다',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2025-07-02',
      startTime: '14:00',
      endTime: '15:00',
      description: '두 번째 이벤트입니다',
      location: '회의실 B',
      category: '미팅',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2025-07-08',
      startTime: '11:00',
      endTime: '12:00',
      description: '세 번째 이벤트입니다',
      location: '온라인',
      category: '교육',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 20,
    },
    {
      id: '4',
      title: '이벤트 4',
      date: '2025-07-15',
      startTime: '16:00',
      endTime: '17:00',
      description: '네 번째 이벤트입니다',
      location: '회의실 C',
      category: '프로젝트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    },
    {
      id: '5',
      title: '이벤트 5',
      date: '2025-07-31',
      startTime: '10:00',
      endTime: '11:00',
      description: '다섯 번째 이벤트입니다',
      location: '회의실 D',
      category: '리뷰',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 25,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const currentDate = new Date('2025-07-01');
    const result = getFilteredEvents(mockEvents, '이벤트 2', currentDate, 'month');

    expect(result).toEqual([
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '14:00',
        endTime: '15:00',
        description: '두 번째 이벤트입니다',
        location: '회의실 B',
        category: '미팅',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15,
      },
    ]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const currentDate = new Date('2025-07-01'); // 2025년 7월 1일 (화요일)
    const result = getFilteredEvents(mockEvents, '', currentDate, 'week');

    // 2025-07-01 주는 6월 29일(일) ~ 7월 5일(토)이므로 이벤트 1, 2만 포함
    expect(result).toEqual([
      {
        id: '1',
        title: 'Event 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '첫 번째 이벤트입니다',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '14:00',
        endTime: '15:00',
        description: '두 번째 이벤트입니다',
        location: '회의실 B',
        category: '미팅',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15,
      },
    ]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-07-01');
    const result = getFilteredEvents(mockEvents, '', currentDate, 'month');

    expect(result).toEqual(mockEvents);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const currentDate = new Date('2025-07-01');
    const result = getFilteredEvents(mockEvents, '이벤트', currentDate, 'week');

    // 검색어 '이벤트'로 필터링 후 주간 뷰 적용
    expect(result).toEqual([
      {
        id: '1',
        title: 'Event 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '첫 번째 이벤트입니다',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '14:00',
        endTime: '15:00',
        description: '두 번째 이벤트입니다',
        location: '회의실 B',
        category: '미팅',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15,
      },
    ]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const currentDate = new Date('2025-07-01');
    const result = getFilteredEvents(mockEvents, '', currentDate, 'month');

    expect(result).toEqual([
      {
        id: '1',
        title: 'Event 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '첫 번째 이벤트입니다',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-02',
        startTime: '14:00',
        endTime: '15:00',
        description: '두 번째 이벤트입니다',
        location: '회의실 B',
        category: '미팅',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15,
      },
      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-08',
        startTime: '11:00',
        endTime: '12:00',
        description: '세 번째 이벤트입니다',
        location: '온라인',
        category: '교육',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 20,
      },
      {
        id: '4',
        title: '이벤트 4',
        date: '2025-07-15',
        startTime: '16:00',
        endTime: '17:00',
        description: '네 번째 이벤트입니다',
        location: '회의실 C',
        category: '프로젝트',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 30,
      },
      {
        id: '5',
        title: '이벤트 5',
        date: '2025-07-31',
        startTime: '10:00',
        endTime: '11:00',
        description: '다섯 번째 이벤트입니다',
        location: '회의실 D',
        category: '리뷰',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 25,
      },
    ]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const currentDate = new Date('2025-07-01');
    const result = getFilteredEvents(mockEvents, 'event', currentDate, 'month');

    expect(result).toEqual([
      {
        id: '1',
        title: 'Event 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '첫 번째 이벤트입니다',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const currentDate = new Date('2025-07-01');
    const result = getFilteredEvents(mockEvents, '', currentDate, 'month');

    // 7월 1일과 7월 31일 이벤트가 모두 포함되어야 함
    expect(result).toEqual(mockEvents);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const currentDate = new Date('2025-07-01');
    const result = getFilteredEvents([], '이벤트', currentDate, 'month');

    expect(result).toEqual([]);
  });
});
