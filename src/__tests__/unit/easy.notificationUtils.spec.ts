import { caseEvent3 } from './dummies.ts';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { createEvent } from '../__fixture__/eventFactory.ts';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    expect(getUpcomingEvents(caseEvent3, new Date('2025-06-30T09:59'), [])).toEqual([
      createEvent({
        title: 'event1',
        date: '2025-06-30',
        startTime: '10:00',
        endTime: '11:00',
        id: '1',
        notificationTime: 1,
      }),
      createEvent({
        title: 'event3',
        date: '2025-06-30',
        startTime: '10:00',
        endTime: '13:00',
        id: '3',
        notificationTime: 1,
      }),
    ]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    expect(getUpcomingEvents(caseEvent3, new Date('2025-06-30T09:59'), ['3'])).toEqual([
      createEvent({
        title: 'event1',
        date: '2025-06-30',
        startTime: '10:00',
        endTime: '11:00',
        id: '1',
        notificationTime: 1,
      }),
    ]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    expect(
      getUpcomingEvents(
        [
          createEvent({
            title: 'event1',
            date: '2025-06-30',
            startTime: '10:00',
            endTime: '11:00',
            id: '1',
            notificationTime: 1,
          }),
        ],
        new Date('2025-06-30T09:00'),
        []
      )
    ).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(caseEvent3, new Date('2025-06-30T09:59'), ['2', '3'])).toEqual([
      createEvent({
        title: 'event1',
        date: '2025-06-30',
        startTime: '10:00',
        endTime: '11:00',
        id: '1',
        notificationTime: 1,
      }),
    ]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = createEvent({
      title: 'event1',
      date: '2025-06-30',
      startTime: '10:00',
      endTime: '11:00',
      id: '1',
      notificationTime: 1,
    });
    expect(createNotificationMessage(event)).toBe('1분 후 event1 일정이 시작됩니다.');
  });
});
