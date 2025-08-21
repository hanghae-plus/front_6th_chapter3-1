import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: '이벤트 2', // title에 포함
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-07-21',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심 식사 이벤트 2', // description에 포함
    location: '',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];
describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-07-21T12:29:00'); // MOCK_EVENTS[1] 시작 12:30, notificationTime = 60분
    const notifiedEvents: string[] = [];
    const upcoming = getUpcomingEvents(MOCK_EVENTS, now, notifiedEvents);
    expect(upcoming).toContain(MOCK_EVENTS[1]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-07-21T11:30:00');
    const notifiedEvents = ['2']; // 이미 알림 완료
    const upcoming = getUpcomingEvents(MOCK_EVENTS, now, notifiedEvents);
    expect(upcoming).not.toContain(MOCK_EVENTS[1]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-07-21T10:00:00'); // 알림 시간 도래 전
    const notifiedEvents: string[] = [];
    const upcoming = getUpcomingEvents(MOCK_EVENTS, now, notifiedEvents);
    expect(upcoming).not.toContain(MOCK_EVENTS[1]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-07-21T12:31:00'); // 알림 시간 지난 후
    const notifiedEvents: string[] = [];
    const upcoming = getUpcomingEvents(MOCK_EVENTS, now, notifiedEvents);
    expect(upcoming).not.toContain(MOCK_EVENTS[1]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const message = createNotificationMessage(MOCK_EVENTS[0]);
    expect(message).toBe('1분 후 이벤트 2 일정이 시작됩니다.');
  });
});
