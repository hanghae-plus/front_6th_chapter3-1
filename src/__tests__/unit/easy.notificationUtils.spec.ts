import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
const events: Event[] = [
  {
    id: '1',
    title: '테스트 일정',
    date: '2024-06-10',
    startTime: '12:00',
    endTime: '13:00',
    description: '',
    location: '',
    category: '',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 10,
  },
];
describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2024-06-10T11:50:00');

    const notifiedEvents: string[] = [];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2024-06-10T11:51:00');

    const notifiedEvents: string[] = ['1'];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-06-10T11:45:00');

    const notifiedEvents: string[] = [];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-06-10T12:01:00');

    const notifiedEvents: string[] = [];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const message = createNotificationMessage(events[0]);
    expect(message).toBe('10분 후 테스트 일정 일정이 시작됩니다.');
  });
});
