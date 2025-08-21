import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const baseEvent: Event = {
    id: '1',
    title: 'Test Event',
    date: '2025-08-22',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-08-22T09:50:00');
    const events = [{ ...baseEvent, id: '1' }];
    const result = getUpcomingEvents(events, now, []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-08-22T09:50:00');
    const events = [{ ...baseEvent, id: '1' }];
    const notifiedEvents = ['1'];
    const result = getUpcomingEvents(events, now, notifiedEvents);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-08-22T09:40:00');
    const events = [{ ...baseEvent, id: '1' }];
    const result = getUpcomingEvents(events, now, []);
    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-08-22T09:55:00');
    const events = [{ ...baseEvent, id: '1' }];
    const result = getUpcomingEvents(events, now, []);
    expect(result).toHaveLength(1);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '팀 회의',
      date: '2025-08-22',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    };
    const message = createNotificationMessage(event);
    expect(message).toBe('15분 후 팀 회의 일정이 시작됩니다.');
  });
});
