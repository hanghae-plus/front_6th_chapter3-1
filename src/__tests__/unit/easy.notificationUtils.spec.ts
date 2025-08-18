import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '오전 회의',
    date: '2025-07-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-07-15',
    startTime: '12:00',
    endTime: '13:00',
    description: '고객과 점심',
    location: '레스토랑',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {});

  it('이미 알림이 간 이벤트는 제외한다', () => {});

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {});

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {});
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = mockEvents[0];
    const message = createNotificationMessage(event);
    expect(message).toBe('10분 후 오전 회의 일정이 시작됩니다.');
  });
});
