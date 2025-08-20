import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { createMockEvent } from '../utils';

describe('getUpcomingEvents: 알림 시간이 범위에 있는 이벤트만 반환', () => {
  const events = [
    createMockEvent(1, {
      date: '2025-07-15',
      startTime: '10:15',
      notificationTime: 30,
    }),
    createMockEvent(2, {
      date: '2025-07-15',
      startTime: '10:30',
      notificationTime: 30,
    }),
    createMockEvent(3, {
      date: '2025-07-15',
      startTime: '11:00',
      notificationTime: 30,
    }),
  ];

  it('10시 0분을 기준으로 알림 시간이 범위에 있는 이벤트만 반환한다', () => {
    // 10:00 기준으로 10:15 와 10:30 가 알림 대상
    const result = getUpcomingEvents(events, new Date('2025-07-15 10:00'), []);
    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('10시 15분을 기준으로 이미 알림을 보낸 이벤트는 제외한다', () => {
    // 10:15 기준으로 10:15 이전에 알림을 보낸 이벤트는 제외, 10:30 은 알림 대상
    const result = getUpcomingEvents(events, new Date('2025-07-15 10:15'), ['1']);
    expect(result.map((e) => e.id)).toEqual(['2']);
  });

  it('09시 0분을 기준으로 아직 알림 시간이 되지 않은 이벤트는 반환하지 않는다', () => {
    // 09:00 기준으로 알림 시간이 되지 않은 이벤트는 제외
    const result = getUpcomingEvents(events, new Date('2025-07-15 09:00'), []);
    expect(result).toHaveLength(0);
  });

  it('10시 20분을 기준으로 이벤트가 이미 시작된 경우는 반환하지 않는다', () => {
    // 10:20 기준으로 10:20 이후에 알림을 보낸 이벤트는 제외
    const result = getUpcomingEvents(events, new Date('2025-07-15 10:20'), ['1']);
    expect(result.map((e) => e.id)).toEqual(['2']);
  });
});

describe('createNotificationMessage: 알림 시간과 일정 제목을 포함한 알림 메시지를 생성', () => {
  const event = createMockEvent(1, {
    title: '팀 회의',
    notificationTime: 30,
  });

  it('알림 시간과 일정 제목을 포함한 알림 메시지를 생성한다', () => {
    const result = createNotificationMessage(event);
    expect(result).toContain('30분');
    expect(result).toContain('팀 회의');
    expect(result).toBe('30분 후 팀 회의 일정이 시작됩니다.');
  });
});
