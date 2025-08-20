import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const testEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    date: '2025-08-19',
    startTime: '10:15:00',
    endTime: '11:00:00',
    notificationTime: 15,
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
  },
  {
    id: '2',
    title: '점심',
    date: '2025-08-19',
    startTime: '12:00:00',
    endTime: '13:00:00',
    notificationTime: 30,
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
  },
  {
    id: '3',
    title: '운동',
    date: '2025-08-19',
    startTime: '10:15:00',
    endTime: '11:00:00',
    notificationTime: 10,
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
  },
  {
    id: '4',
    title: '미팅',
    date: '2025-08-19',
    startTime: '10:30:00',
    endTime: '11:30:00',
    notificationTime: 30,
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
  },
];

const now = new Date('2025-08-19T10:00:00');

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const notifiedEvents: string[] = [];
    const upcoming = getUpcomingEvents(testEvents, now, notifiedEvents);
    expect(upcoming).toHaveLength(2);
    expect(upcoming.some((e) => e.id === '1')).toBe(true);
    expect(upcoming.some((e) => e.id === '4')).toBe(true);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const notifiedEvents: string[] = ['1'];
    const upcoming = getUpcomingEvents(testEvents, now, notifiedEvents);
    expect(upcoming).toHaveLength(1);
    expect(upcoming.some((e) => e.id === '4')).toBe(true);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const notifiedEvents: string[] = [];
    const upcoming = getUpcomingEvents(testEvents, now, notifiedEvents);
    expect(upcoming.some((e) => e.id === '2')).toBe(false);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const notifiedEvents: string[] = [];
    const upcoming = getUpcomingEvents(testEvents, now, notifiedEvents);
    expect(upcoming.some((e) => e.id === '3')).toBe(false);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const message = createNotificationMessage(testEvents[0]);
    expect(message).toBe('15분 후 회의 일정이 시작됩니다.');
  });
});
