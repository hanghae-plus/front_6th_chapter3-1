import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '회의 시간',
      date: '2025-07-15',
      startTime: '10:10',
      endTime: '11:10',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10, // 10분전
    },
    {
      id: '2',
      title: '점심 시간',
      date: '2025-07-15',
      startTime: '11:00',
      endTime: '11:30',
      description: '점심 약속',
      location: '레스토랑',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60, // 1시간전
    },
    {
      id: '3',
      title: '외부 미팅',
      date: '2025-07-15',
      startTime: '11:01',
      endTime: '12:00',
      description: '긴급 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 1,
    },
    {
      id: '4',
      title: '프레젠테이션',
      date: '2025-07-15',
      startTime: '08:00',
      endTime: '09:00',
      description: '프로젝트 발표',
      location: '대회의실',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60,
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    // 지정된 시간에 도달한 이벤트가 2개인지 확인
    const nowDateTime = new Date('2025-07-15T10:00:00');
    const notifiedEvents: string[] = [];
    const result = getUpcomingEvents(mockEvents, nowDateTime, notifiedEvents);
    const resultIds = result.map((event) => event.id);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('회의 시간');
    expect(result[1].title).toBe('점심 시간');

    expect(resultIds).toContain('1');
    expect(resultIds).toContain('2');
    expect(resultIds).not.toContain('3');
    expect(resultIds).not.toContain('4');
  });

  it('이미 알림이 간 이벤트가 있다면 제외한다', () => {
    // 지정된 시간에 도달한 이벤트가 1개인지 확인
    const nowDateTime = new Date('2025-07-15T10:00:00');
    // id 1은 제외
    const notifiedEvents: string[] = ['1'];
    const result = getUpcomingEvents(mockEvents, nowDateTime, notifiedEvents);
    const resultIds = result.map((event) => event.id);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('점심 시간');

    expect(resultIds).toContain('2');
    expect(resultIds).not.toContain('1');
    expect(resultIds).not.toContain('3');
    expect(resultIds).not.toContain('4');
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const nowDateTime = new Date('2025-07-15T09:00:00');
    const notifiedEvents: string[] = [];
    const result = getUpcomingEvents(mockEvents, nowDateTime, notifiedEvents);
    const resultIds = result.map((event) => event.id);

    expect(result).toHaveLength(0);
    expect(resultIds).not.toContain('1');
    expect(resultIds).not.toContain('2');
    expect(resultIds).not.toContain('3');
    expect(resultIds).not.toContain('4');
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const nowDateTime = new Date('2025-07-15T10:00:00');
    const notifiedEvents: string[] = [];
    const result = getUpcomingEvents(mockEvents, nowDateTime, notifiedEvents);
    const resultIds = result.map((event) => event.id);

    expect(result).toHaveLength(2);

    // 이미 지난 이벤트 체크
    expect(resultIds).not.toContain('4');
    result.forEach((event) => {
      expect(event.title).not.toEqual({
        id: '4',
        title: '프레젠테이션',
        date: '2025-07-15',
        startTime: '08:00',
        endTime: '09:00',
        description: '프로젝트 발표',
        location: '대회의실',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 60,
      });
    });
  });

  // 엣지케이스
  it('빈 이벤트 배열에 대해 빈 배열을 반환한다', () => {
    const now = new Date('2025-07-15T10:00:00');
    const result = getUpcomingEvents([], now, []);

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('모든 이벤트가 이미 알림된 경우 빈 배열을 반환한다', () => {
    const now = new Date('2025-07-15T10:00:00');
    const allNotified = ['1', '2', '3', '4'];
    const result = getUpcomingEvents(mockEvents, now, allNotified);

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('이벤트 타이틀에 맞는 올바른 알림 메시지를 생성해야 한다', () => {
    const mockEvents: Event = {
      id: '1',
      title: '팀 회의',
      date: '2025-07-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60,
    };
    const result = createNotificationMessage(mockEvents);
    expect(result).toBe('60분 후 팀 회의 일정이 시작됩니다.');
  });

  it('이모지가 포함된 제목도 올바르게 처리한다', () => {
    const specialEvent: Event = {
      id: '1',
      title: '🚨 회의 (긴급)',
      date: '2025-07-15',
      startTime: '10:15',
      endTime: '11:00',
      description: '긴급 회의',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const result = createNotificationMessage(specialEvent);
    expect(result).toBe('10분 후 🚨 회의 (긴급) 일정이 시작됩니다.');
  });
});
