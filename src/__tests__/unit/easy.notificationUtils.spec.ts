import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const events = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    notificationTime: 1,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2025-07-02',
    startTime: '10:00',
    endTime: '11:00',
    notificationTime: 1,
  },
  {
    id: '3',
    title: '이벤트 3',
    date: '2025-07-03',
    startTime: '11:00',
    endTime: '12:00',
    notificationTime: 1,
  },
] as Event[];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-07-01T08:59');
    const notifiedEvents = ['3'];
    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        notificationTime: 1,
      },
    ]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-07-01T08:59');
    const notifiedEvents = ['1', '2'];
    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-07-01T08:00');
    const notifiedEvents = ['3'];
    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-07-01T11:00');
    const notifiedEvents = ['3'];
    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const result = createNotificationMessage(events[0]);

    expect(result).toBe('1분 후 이벤트 1 일정이 시작됩니다.');
  });
});
