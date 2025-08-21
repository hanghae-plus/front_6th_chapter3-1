import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
// export function createNotificationMessage({ notificationTime, title }: Event) {
//   return `${notificationTime}분 후 ${title} 일정이 시작됩니다.`;
// }

// export function getUpcomingEvents(events: Event[], now: Date, notifiedEvents: string[]) {
//   return events.filter((event) => {
//     const eventStart = new Date(`${event.date}T${event.startTime}`);
//     const timeDiff = (eventStart.getTime() - now.getTime()) / 분;
//     return timeDiff > 0 && timeDiff <= event.notificationTime && !notifiedEvents.includes(event.id);
//   });
// }
describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '회의',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10, // 시작 10분 전에 알림
      },
      {
        id: '2',
        title: '점심',
        date: '2025-07-01',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const now = new Date('2025-07-01T09:50:00'); // 현재 시간
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcomingEvents).toEqual([
      {
        id: '1',
        title: '회의',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '회의',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const now = new Date('2025-07-01T09:50:00');
    const notifiedEvents = ['1']; // 이미 알림이 간 이벤트
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcomingEvents).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '회의',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const now = new Date('2025-07-01T09:40:00'); // 현재 시간
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcomingEvents).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events: Event[] = [
      {
        id: '1',
        title: '회의',
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    const now = new Date('2025-07-01T10:15:00'); // 현재 시간
    const notifiedEvents: string[] = [];
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcomingEvents).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const notificationTime = 10;
    const title = '테스트이벤트';
    expect(createNotificationMessage({ notificationTime, title })).toBe(
      `${notificationTime}분 후 ${title} 일정이 시작됩니다.`
    );
  });
});
