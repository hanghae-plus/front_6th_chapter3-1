import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const mockEvent: Event = {
  id: '1',
  title: '테스트 이벤트',
  date: '2025-01-15',
  startTime: '14:00',
  endTime: '15:00',
  description: '테스트 설명',
  location: '테스트 장소',
  category: '개인',
  notificationTime: 10,
};

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const events = [mockEvent];
    const now = new Date('2025-01-15T13:50:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([mockEvent]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const events = [mockEvent];
    const now = new Date('2025-01-15T13:55:00');
    const notifiedEvents = ['1'];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const events = [mockEvent];
    const now = new Date('2025-01-15T13:45:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const events = [mockEvent];
    const now = new Date('2025-01-15T14:05:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(events, now, notifiedEvents);

    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const result = createNotificationMessage(mockEvent);

    expect(result).toBe('10분 후 테스트 이벤트 일정이 시작됩니다.');
  });

  it('다른 알림 시간에 대해 올바른 메시지를 생성한다', () => {
    const event = { ...mockEvent, notificationTime: 30, title: '회의' };

    const result = createNotificationMessage(event);

    expect(result).toBe('30분 후 회의 일정이 시작됩니다.');
  });
});
