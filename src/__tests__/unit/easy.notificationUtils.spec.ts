import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const createMockEvent = (
    id: string,
    date: string,
    startTime: string,
    notificationTime: number,
    title: string
  ): Event => ({
    id,
    date,
    startTime,
    notificationTime,
    title,
    endTime: '11:00',
    description: '설명',
    location: '위치',
    category: '카테고리',
    repeat: { type: 'none', interval: 1 },
  });

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    // 현재 시간: 2025-07-01 09:50:00
    // 이벤트: 2025-07-01 10:00:00 시작, 10분 전 알림
    const now = new Date('2025-07-01T09:50:00');
    const events = [createMockEvent('1', '2025-07-01', '10:00', 10, '회의')];

    const result = getUpcomingEvents(events, now, []);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].title).toBe('회의');
  });

  it('알림 시간 범위 내의 이벤트를 반환한다', () => {
    // 현재 시간: 2025-07-01 09:55:00
    // 이벤트: 2025-07-01 10:00:00 시작, 10분 전 알림
    const now = new Date('2025-07-01T09:55:00');
    const events = [createMockEvent('1', '2025-07-01', '10:00', 10, '회의')];

    const result = getUpcomingEvents(events, now, []);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-07-01T09:50:00');
    const events = [
      createMockEvent('1', '2025-07-01', '10:00', 10, '회의'),
      createMockEvent('2', '2025-07-01', '10:05', 15, '미팅'),
    ];
    const notifiedEvents = ['1'];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
    expect(result[0].title).toBe('미팅');
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    // 현재 시간: 2025-07-01 09:40:00
    // 이벤트: 2025-07-01 10:00:00 시작, 10분 전 알림
    const now = new Date('2025-07-01T09:40:00');
    const events = [createMockEvent('1', '2025-07-01', '10:00', 10, '회의')];

    const result = getUpcomingEvents(events, now, []);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    // 현재 시간: 2025-07-01 10:05:00 (이미 이벤트 시작됨)
    // 이벤트: 2025-07-01 10:00:00 시작
    const now = new Date('2025-07-01T10:05:00');
    const events = [createMockEvent('1', '2025-07-01', '10:00', 10, '회의')];

    const result = getUpcomingEvents(events, now, []);

    expect(result).toHaveLength(0);
  });

  it('여러 이벤트 중 조건을 만족하는 이벤트만 반환한다', () => {
    const now = new Date('2025-07-01T09:50:00');
    const events = [
      createMockEvent('1', '2025-07-01', '10:00', 10, '회의'), // 10분 차이, 10분 알림 → 포함
      createMockEvent('2', '2025-07-01', '10:15', 5, '미팅'), // 25분 차이, 5분 알림 → 제외
      createMockEvent('3', '2025-07-01', '10:05', 10, '점심'), // 15분 차이, 10분 알림 → 제외
      createMockEvent('4', '2025-07-01', '09:45', 10, '발표'), // -5분 차이 → 제외
    ];

    const result = getUpcomingEvents(events, now, []);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].title).toBe('회의');
  });

  it('다양한 알림 시간을 가진 이벤트들을 올바르게 처리한다', () => {
    const now = new Date('2025-07-01T09:50:00');
    const events = [
      createMockEvent('1', '2025-07-01', '10:00', 10, '10분 알림'), // 10분 차이, 10분 알림 → 포함
      createMockEvent('2', '2025-07-01', '10:05', 15, '15분 알림'), // 15분 차이, 15분 알림 → 포함
      createMockEvent('3', '2025-07-01', '10:10', 5, '5분 알림'), // 20분 차이, 5분 알림 → 제외
      createMockEvent('4', '2025-07-01', '09:51', 1, '1분 알림'), // 1분 차이, 1분 알림 → 포함
    ];

    const result = getUpcomingEvents(events, now, []);

    expect(result).toHaveLength(3);
    const resultIds = result.map((e) => e.id).sort();
    expect(resultIds).toEqual(['1', '2', '4']);
  });

  it('빈 이벤트 배열에 대해 빈 배열을 반환한다', () => {
    const now = new Date('2025-07-01T09:50:00');
    const events: Event[] = [];

    const result = getUpcomingEvents(events, now, []);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('모든 이벤트가 이미 알림 간 경우 빈 배열을 반환한다', () => {
    const now = new Date('2025-07-01T09:50:00');
    const events = [
      createMockEvent('1', '2025-07-01', '10:00', 10, '회의'),
      createMockEvent('2', '2025-07-01', '10:30', 15, '미팅'),
    ];
    const notifiedEvents = ['1', '2']; // 모든 이벤트가 이미 알림 감

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      notificationTime: 10,
      title: '항해',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '카테고리',
      repeat: { type: 'none', interval: 1 },
    };

    const message = createNotificationMessage(event);

    expect(message).toBe('10분 후 항해 일정이 시작됩니다.');
  });

  it('다양한 알림 시간과 제목에 대해 올바른 메시지를 생성한다', () => {
    const testCases = [
      { notificationTime: 1, title: '항해 회의', expected: '1분 후 항해 회의 일정이 시작됩니다.' },
      { notificationTime: 5, title: '항해 점심', expected: '5분 후 항해 점심 일정이 시작됩니다.' },
      {
        notificationTime: 15,
        title: '항해 발표',
        expected: '15분 후 항해 발표 일정이 시작됩니다.',
      },
      {
        notificationTime: 30,
        title: '항해 모임',
        expected: '30분 후 항해 모임 일정이 시작됩니다.',
      },
      {
        notificationTime: 60,
        title: '항해 발제',
        expected: '60분 후 항해 발제 일정이 시작됩니다.',
      },
    ];

    testCases.forEach(({ notificationTime, title, expected }) => {
      const event: Event = {
        id: '1',
        notificationTime,
        title,
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명',
        location: '위치',
        category: '카테고리',
        repeat: { type: 'none', interval: 1 },
      };

      const message = createNotificationMessage(event);
      expect(message).toBe(expected);
    });
  });

  it('특수 문자가 포함된 제목도 올바르게 처리한다', () => {
    const event: Event = {
      id: '1',
      notificationTime: 5,
      title: '[중요] 항해',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '카테고리',
      repeat: { type: 'none', interval: 1 },
    };

    const message = createNotificationMessage(event);

    expect(message).toBe('5분 후 [중요] 항해 일정이 시작됩니다.');
  });

  it('빈 제목에 대해서도 올바른 형식의 메시지를 생성한다', () => {
    const event: Event = {
      id: '1',
      notificationTime: 10,
      title: '',
      date: '2025-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '카테고리',
      repeat: { type: 'none', interval: 1 },
    };

    const message = createNotificationMessage(event);

    expect(message).toBe('10분 후  일정이 시작됩니다.');
  });
});
