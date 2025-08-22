import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { createEventMock } from '../utils';

const sampleEvents = [
  createEventMock({
    id: '1',
    title: '테스트 이벤트 1',
    date: '2025-08-01',
    startTime: '08:00',
    endTime: '10:00',
    notificationTime: 20,
  }),
  createEventMock({
    id: '2',
    date: '2025-08-20',
    startTime: '10:00',
    endTime: '11:00',
  }),
  createEventMock({
    id: '3',
    date: '2025-08-21',
    startTime: '12:00',
    endTime: '20:00',
  }),
];

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-08-20T09:50:00');
    const notificationEvents = [sampleEvents[0].id];
    const upcomingEvents = getUpcomingEvents(sampleEvents, now, notificationEvents);

    expect(upcomingEvents).toEqual([sampleEvents[1]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-08-21T11:50:00');
    const notificationEvents = [sampleEvents[0].id, sampleEvents[1].id];
    const upcomingEvents = getUpcomingEvents(sampleEvents, now, notificationEvents);

    expect(upcomingEvents).toEqual([sampleEvents[2]]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-08-21T11:50:00');
    const notificationEvents = [sampleEvents[0].id, sampleEvents[1].id];
    const upcomingEvents = getUpcomingEvents(sampleEvents, now, notificationEvents);

    expect(upcomingEvents).toEqual([sampleEvents[2]]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-08-22T11:50:00');
    const notificationEvents = [sampleEvents[0].id, sampleEvents[1].id];
    const upcomingEvents = getUpcomingEvents(sampleEvents, now, notificationEvents);

    expect(upcomingEvents).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const notiMessage = createNotificationMessage(sampleEvents[0]);

    expect(notiMessage).toBe('20분 후 테스트 이벤트 1 일정이 시작됩니다.');
  });
});
