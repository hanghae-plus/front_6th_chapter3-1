import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { createMockEvent } from '../utils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const event = createMockEvent(1, {
      date: '2025-08-14',
      startTime: '09:00',
      notificationTime: 1,
    });

    const result = getUpcomingEvents([event], new Date('2025-08-14T08:59:00'), []);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(event);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const event = createMockEvent(1, {
      date: '2025-08-14',
      startTime: '09:00',
      notificationTime: 1,
    });

    const result = getUpcomingEvents([event], new Date('2025-08-14T08:59:00'), ['1']);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const event = createMockEvent(1, {
      date: '2025-08-14',
      startTime: '09:00',
      notificationTime: 1,
    });

    const result = getUpcomingEvents([event], new Date('2025-08-14T09:10:00'), []);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = createMockEvent(1, {
      title: '[필수] 중요한 회의!',
      notificationTime: 5,
    });

    const result = createNotificationMessage(event);

    expect(result).toBe('5분 후 [필수] 중요한 회의! 일정이 시작됩니다.');
  });
});
