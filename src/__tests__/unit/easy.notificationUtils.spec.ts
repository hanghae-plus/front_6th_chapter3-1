import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

const events = [
  {
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '팀 회의',
    date: '2025-08-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 60,
  },
  {
    id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
    title: '점심 약속',
    date: '2025-08-21',
    startTime: '12:30',
    endTime: '13:30',
    description: '동료와 점심 식사',
    location: '회사 근처 식당',
    category: '개인',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 60,
  },
] as Event[];

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime('2025-08-20T09:30:00');
});

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    // Given: 알림 시간이 정확히 도래한 이벤트 ID
    const eventId = '2b7545a6-ebee-426c-b906-2329bc8d62bd';

    // When: getUpcomingEvents 함수를 호출하면
    const upcomingEvent = getUpcomingEvents(events, new Date(), []);

    // Then: 알림 시간이 정확히 도래한 이벤트를 반환한다
    expect(upcomingEvent.find((event) => event.id === eventId)).toBeDefined();
    expect(upcomingEvent.find((event) => event.id === eventId)?.id).toBe(eventId);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    // Given: 이미 알림이 간 이벤트 ID 목록
    const notifiedEventIds = ['2b7545a6-ebee-426c-b906-2329bc8d62bd'];

    // When: getUpcomingEvents 함수를 호출하면
    const upcomingEvent = getUpcomingEvents(events, new Date(), notifiedEventIds);

    // Then: 이미 알림이 간 이벤트는 제외한다
    expect(upcomingEvent.find((event) => notifiedEventIds.includes(event.id))).toBeUndefined();
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    // Given: 알림 시간이 아직 도래하지않은 이벤트 ID
    const eventId = '09702fb3-a478-40b3-905e-9ab3c8849dcd';

    // When: getUpcomingEvents 함수를 호출하면
    const upcomingEvent = getUpcomingEvents(events, new Date(), []);

    // Then: 알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다
    expect(upcomingEvent.find((event) => event.id === eventId)).toBeUndefined();
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    // Given: 알림 시간이 지난 이벤트 ID
    const eventId = '2b7545a6-ebee-426c-b906-2329bc8d62bd';

    // When: getUpcomingEvents 함수를 호출하면
    const upcomingEvent = getUpcomingEvents(events, new Date('2025-08-21T09:30:00'), []);

    // Then: 알림 시간이 지난 이벤트는 반환하지 않는다
    expect(upcomingEvent.find((event) => event.id === eventId)).toBeUndefined();
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    // Given: 알림 메시지를 생성할 이벤트
    const event = events[0];

    // When: createNotificationMessage 함수를 호출하면
    const notificationMessage = createNotificationMessage(event);

    // Then: 올바른 알림 메시지를 생성한다
    expect(notificationMessage).toBe('60분 후 팀 회의 일정이 시작됩니다.');
  });
});
