import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { createMockEvent } from '../utils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events = [
      createMockEvent(1, {
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        notificationTime: 1,
      }),
      createMockEvent(2, {
        date: '2025-07-01',
        startTime: '14:31',
        endTime: '15:31',
        notificationTime: 1,
      }),
    ];
    const now = new Date('2025-07-01T14:29:00');

    expect(getUpcomingEvents(events, now, [])).toEqual([events[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events = [
      createMockEvent(1, {
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        notificationTime: 1,
      }),
    ];
    const now = new Date('2025-07-01T14:29:00');

    expect(getUpcomingEvents(events, now, [events[0].id])).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events = [
      createMockEvent(1, {
        date: '2025-07-01',
        startTime: '14:35',
        endTime: '15:35',
        notificationTime: 1,
      }),
    ];
    const now = new Date('2025-07-01T14:30:00');

    expect(getUpcomingEvents(events, now, [])).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events = [
      createMockEvent(1, {
        date: '2025-07-01',
        startTime: '14:30',
        endTime: '15:30',
        notificationTime: 1,
      }),
    ];
    const now = new Date('2025-07-01T14:31:00');

    expect(getUpcomingEvents(events, now, [])).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = createMockEvent(1, {
      title: '점심 회식',
      notificationTime: 1,
    });

    expect(createNotificationMessage(event)).toBe('1분 후 점심 회식 일정이 시작됩니다.');
  });
});
