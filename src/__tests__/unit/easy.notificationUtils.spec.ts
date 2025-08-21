import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { createEvent } from '../utils';

describe('getUpcomingEvents', () => {
  const events = [
    createEvent({
      id: '1',
      title: 'event 2',
      date: '2025-08-18',
      startTime: '08:50',
      notificationTime: 5,
    }),
    createEvent({
      id: '2',
      title: 'event 3',
      date: '2025-08-18',
      startTime: '09:50',
      notificationTime: 10,
    }),
  ];
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    expect(getUpcomingEvents(events, new Date('2025-08-18T08:45:00'), [])).toEqual([events[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    expect(getUpcomingEvents(events, new Date('2025-08-18T08:55:00'), [])).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, new Date('2025-08-18T08:10:00'), [])).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, new Date('2025-08-18T10::00'), [])).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  const event = createEvent({ notificationTime: 10, title: '눈누난나' });
  it('올바른 알림 메시지를 생성해야 한다', () => {
    expect(createNotificationMessage(event)).toBe('10분 후 눈누난나 일정이 시작됩니다.');
  });
});
