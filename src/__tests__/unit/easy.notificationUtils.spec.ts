import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const event = {
  id: '1',
  date: '2025-10-01',
  startTime: '10:00:00',
  endTime: '11:00:00',
  title: 'test',
  notificationTime: 10,
};

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const result = getUpcomingEvents([{ ...event }], new Date('2025-10-01T09:50:00'), []);

    expect(result).toEqual([event]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const result = getUpcomingEvents([{ ...event }], new Date('2025-10-01T10:00:00'), ['1']);

    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents([{ ...event }], new Date('2025-10-01T09:40:00'), []);

    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents([{ ...event }], new Date('2025-10-01T10:00:00'), []);

    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const result = createNotificationMessage({ notificationTime: 10, title: 'test' });

    expect(result).toBe('10분 후 test 일정이 시작됩니다.');
  });
});
