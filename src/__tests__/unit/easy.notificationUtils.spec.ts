import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const events = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-07-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2025-07-02',
    startTime: '14:00',
    endTime: '15:00',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '3',
    title: '이벤트 3',
    date: '2025-07-31',
    startTime: '14:00',
    endTime: '15:00',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '4',
    title: 'EvEnT 4',
    date: '2025-07-31',
    startTime: '14:00',
    endTime: '15:00',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '5',
    title: 'EvEnT 5',
    date: '2025-08-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
] as Event[];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const result = getUpcomingEvents(events, new Date('2025-07-01T13:59:00'), []);

    console.log(result);

    expect(result).toEqual([events[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const result = getUpcomingEvents(events, new Date('2025-07-01T13:59:00'), ['1']);

    console.log(result);

    expect(result).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(events, new Date('2025-07-01T13:00:00'), []);

    console.log(result);

    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const result = getUpcomingEvents(events, new Date('2025-07-01T14:01:00'), []);

    console.log(result);

    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = events[0];

    const { notificationTime, title } = event;

    const result = createNotificationMessage(event);

    console.log(result);

    expect(result).toBe(`${notificationTime}분 후 ${title} 일정이 시작됩니다.`);
  });
});
