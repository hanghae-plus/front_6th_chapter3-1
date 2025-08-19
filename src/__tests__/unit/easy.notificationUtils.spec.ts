import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { mockNotificationEvents } from '../test-data';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-08-20T09:45:00');
    const events = mockNotificationEvents;
    const result = getUpcomingEvents(events, now, []);
    expect(result).toEqual([events[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-08-20T09:45:00');
    const events = mockNotificationEvents;

    const alreadyNotified = ['1'];

    const result = getUpcomingEvents(events, now, alreadyNotified);
    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-08-20T07:55:00');
    const events = mockNotificationEvents;
    const result = getUpcomingEvents(events, now, []);
    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-08-20T14:55:00');
    const events = mockNotificationEvents;
    const result = getUpcomingEvents(events, now, []);
    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트',
      date: '2025-08-20',
      startTime: '10:00',
      endTime: '11:00',
      notificationTime: 10,
      repeat: {
        type: 'none',
        interval: 0,
      },
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
    };
    const message = createNotificationMessage(event);
    expect(message).toEqual('10분 후 테스트 일정이 시작됩니다.');
  });
});
