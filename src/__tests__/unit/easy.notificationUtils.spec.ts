import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { createEvent } from '../utils';

// todo fix
describe('getUpcomingEvents', () => {
  const events = [
    createEvent({
      id: '1',
      title: 'event 1',
      date: '2025-07-01',
      startTime: '09:00',
      endTime: '10:00',
    }),
    createEvent({
      id: '2',
      title: 'event 2',
      date: '2025-08-18',
      startTime: '08:50',
      endTime: '10:00',
    }),
    createEvent({
      id: '3',
      title: 'event 3',
      date: '2025-08-18',
      startTime: '09:00',
      endTime: '10:00',
    }),
    createEvent({
      id: '4',
      title: 'event 4',
      date: '2025-08-20',
      startTime: '09:00',
      endTime: '10:00',
    }),
  ];
  const now = new Date('2025-08-18T09:00:00');
  const notifiedEvents = [events[0].id, events[1].id];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    expect(getUpcomingEvents(events, now, notifiedEvents)).toEqual([events[2]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    expect(getUpcomingEvents(events, now, notifiedEvents)).toEqual([events[2]]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, now, notifiedEvents)).toEqual([events[2]]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(events, now, notifiedEvents)).toEqual([events[2]]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = createEvent({
      notificationTime: 10,
      title: '이벤트',
    });

    expect(createNotificationMessage(event)).toEqual('10분 후 이벤트 일정이 시작됩니다.');
  });
});
