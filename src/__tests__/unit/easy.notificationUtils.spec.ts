import { createTestEvent } from '../../__mocks__/handlersUtils';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime('2025-08-20T09:30:00');
});

describe('getUpcomingEvents', () => {
  const testEvents = [
    createTestEvent({
      id: '1',
      title: '팀 회의',
      date: '2025-08-20',
      startTime: '10:00',
      endTime: '11:00',
      notificationTime: 60, // 60분 전 알림 (현재 09:30, 시작 10:00이므로 알림 시간)
    }),
    createTestEvent({
      id: '2',
      title: '점심 약속',
      date: '2025-08-21',
      startTime: '12:30',
      endTime: '13:30',
      notificationTime: 60, // 내일 일정이므로 아직 알림 시간 아님
    }),
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    // Given: 알림 시간이 도래한 이벤트들
    // When: getUpcomingEvents 호출
    const result = getUpcomingEvents(testEvents, new Date(), []);

    // Then: 해당 이벤트가 반환됨
    expect(result.find((event) => event.id === '1')).toBeDefined();
    expect(result.find((event) => event.id === '1')?.title).toBe('팀 회의');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    // Given: 이미 알림이 간 이벤트 ID 목록
    const notifiedIds = ['1'];

    // When: getUpcomingEvents 호출
    const result = getUpcomingEvents(testEvents, new Date(), notifiedIds);

    // Then: 해당 이벤트는 제외됨
    expect(result.find((event) => event.id === '1')).toBeUndefined();
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    // Given: 내일 일정 (아직 알림 시간 아님)
    // When: getUpcomingEvents 호출
    const result = getUpcomingEvents(testEvents, new Date(), []);

    // Then: 내일 일정은 반환되지 않음
    expect(result.find((event) => event.id === '2')).toBeUndefined();
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    // Given: 알림 시간이 지난 상황 (다음날)
    // When: 다음날 시간으로 getUpcomingEvents 호출
    const result = getUpcomingEvents(testEvents, new Date('2025-08-21T09:30:00'), []);

    // Then: 어제 일정은 반환되지 않음
    expect(result.find((event) => event.id === '1')).toBeUndefined();
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성한다', () => {
    // Given: 60분 전 알림 설정된 이벤트
    const event = createTestEvent({
      title: '팀 회의',
      notificationTime: 60,
    });

    // When: createNotificationMessage 호출
    const message = createNotificationMessage(event);

    // Then: 올바른 알림 메시지 생성
    expect(message).toBe('60분 후 팀 회의 일정이 시작됩니다.');
  });

  it('다른 알림 시간에 대해서도 올바른 메시지를 생성한다', () => {
    // Given: 10분 전 알림 설정된 이벤트
    const event = createTestEvent({
      title: '중요한 미팅',
      notificationTime: 10,
    });

    // When: createNotificationMessage 호출
    const message = createNotificationMessage(event);

    // Then: 올바른 알림 메시지 생성
    expect(message).toBe('10분 후 중요한 미팅 일정이 시작됩니다.');
  });
});
