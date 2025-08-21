import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const notifiedMockEvents: Event[] = [
  {
    id: '1',
    title: '10분 후 회의',
    date: '2025-10-01', // 오늘
    startTime: '10:10', // 현재(10:00)로부터 10분 후
    endTime: '11:00',
    description: '팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1, // 1분 전 알림
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-10-01',
    startTime: '11:00', // 현재로부터 1시간 후
    endTime: '12:00',
    description: '점심 약속',
    location: '식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10, // 10분 전 알림
  },
  {
    id: '3',
    title: '이미 지난 이벤트',
    date: '2025-10-01',
    startTime: '09:00', // 이미 지나감
    endTime: '09:30',
    description: '지난 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  },
  {
    id: '4',
    title: '너무 먼 미래 이벤트',
    date: '2025-10-01',
    startTime: '15:00', // 5시간 후
    endTime: '16:00',
    description: '미래 미팅',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60, // 1시간 전 알림
  },
];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const currentTime = new Date('2025-10-01T10:09:00');
    const notifiedEvents: string[] = []; // 아직 아무 알림도 안 감

    const result = getUpcomingEvents(notifiedMockEvents, currentTime, notifiedEvents);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const currentTime = new Date('2025-10-01T10:50:00');
    const notifiedEvents: string[] = ['2']; // 아직 아무 알림도 안 감

    const result = getUpcomingEvents(notifiedMockEvents, currentTime, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const currentTime = new Date('2025-10-01T15:01:00');
    const notifiedEvents: string[] = []; // 아직 아무 알림도 안 감

    const result = getUpcomingEvents(notifiedMockEvents, currentTime, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const currentTime = new Date('2025-10-01T15:01:00');
    const notifiedEvents: string[] = []; // 아직 아무 알림도 안 감

    const result = getUpcomingEvents(notifiedMockEvents, currentTime, notifiedEvents);

    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const result = createNotificationMessage(notifiedMockEvents[1]);
    console.log(result);

    expect(result).toBe('10분 후 점심 약속 일정이 시작됩니다.');
  });
});
