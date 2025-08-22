import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '오전 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '오전 회의입니다',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15, // 15분 전 알림
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-07-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '점심 약속입니다',
      location: '식당',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30, // 30분 전 알림
    },
    {
      id: '3',
      title: '오후 세미나',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '오후 세미나입니다',
      location: '강당',
      category: '교육',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 150, // 150분 전 알림
    },
    {
      id: '4',
      title: '저녁 회의',
      date: '2025-07-01',
      startTime: '18:00',
      endTime: '19:00',
      description: '저녁 회의입니다',
      location: '회의실 B',
      category: '회의',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15, // 15분 전 알림
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-07-01T08:45:00');
    const notifiedEvents: string[] = [];

    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(1);
    expect(upcomingEvents[0].id).toBe('1');
    expect(upcomingEvents[0].title).toBe('오전 회의');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-07-01T08:45:00');
    const notifiedEvents = ['1'];

    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-07-01T08:30:00');
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-07-01T09:15:00');
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(0);
  });

  // 여러 이벤트 처리 케이스 추가
  it('여러 이벤트의 알림 시간이 동시에 도래하면 모두 반환한다', () => {
    const now = new Date('2025-07-01T11:30:00');
    const notifiedEvents: string[] = [];

    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(2);
    expect(upcomingEvents.map((e) => e.id)).toContain('2');
    expect(upcomingEvents.map((e) => e.id)).toContain('3');
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '중요한 회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '중요한 회의입니다',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    };

    const message = createNotificationMessage(event);

    expect(message).toBe('15분 후 중요한 회의 일정이 시작됩니다.');
  });

  // 여러 엣지 케이스들 추가
  it('다양한 알림 시간에 대해 올바른 메시지를 생성한다', () => {
    const event1: Event = {
      id: '1',
      title: '회의',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '회의입니다',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 1,
    };

    const event2: Event = {
      id: '2',
      title: '세미나',
      date: '2025-07-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '세미나입니다',
      location: '강당',
      category: '교육',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60,
    };

    const message1 = createNotificationMessage(event1);
    const message2 = createNotificationMessage(event2);

    expect(message1).toBe('1분 후 회의 일정이 시작됩니다.');
    expect(message2).toBe('60분 후 세미나 일정이 시작됩니다.');
  });

  it('특수 문자가 포함된 이벤트에 대해서 특수 문자가 포함된 메시지를 생성한다', () => {
    const event: Event = {
      id: '1',
      title: '회의 & 세미나 (중요)',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '특수 문자가 포함된 제목',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    };

    const message = createNotificationMessage(event);

    expect(message).toBe('30분 후 회의 & 세미나 (중요) 일정이 시작됩니다.');
  });

  // 긴 텍스트에 대한 경계값 테스트
  it('긴 제목을 가진 이벤트에 대해서 긴 제목을 포함한 메시지를 생성한다', () => {
    const event: Event = {
      id: '1',
      title:
        '매우 긴 제목을 가진 중요한 회의와 세미나가 동시에 진행되는 특별한 이벤트 매우 긴 제목을 가진 중요한 회의와 세미나가 동시에 진행되는 특별한 이벤트',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '긴 제목 테스트',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 45,
    };

    const message = createNotificationMessage(event);

    expect(message).toBe(
      '45분 후 매우 긴 제목을 가진 중요한 회의와 세미나가 동시에 진행되는 특별한 이벤트 매우 긴 제목을 가진 중요한 회의와 세미나가 동시에 진행되는 특별한 이벤트 일정이 시작됩니다.'
    );
  });

  // 이모지 인코딩 테스트
  it('이모지를 포함한 이벤트에 대해서 이모지를 포함한 메시지를 생성한다', () => {
    const event: Event = {
      id: '1',
      title: '🔥🚨👉 급한 중요한 회의🏢 💥💣💥 이벤트 1👐👈👊',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '긴 제목 테스트',
      location: '회의실 A',
      category: '회의',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 45,
    };

    const message = createNotificationMessage(event);

    expect(message).toBe(
      '45분 후 🔥🚨👉 급한 중요한 회의🏢 💥💣💥 이벤트 1👐👈👊 일정이 시작됩니다.'
    );
  });
});
