import { getUpcomingEvents } from '../../utils/notificationUtils';
import { createTestEvent } from '../utils';

describe('getUpcomingEvents', () => {
  describe('알림 시간 계산', () => {
    it('10분 전 알림 설정된 이벤트가 현재 알림 시간에 도달했을 때 반환한다', () => {
      const events = [
        createTestEvent({
          title: '팀 회의',
          date: '2025-01-01',
          startTime: '10:00',
          notificationTime: 10,
        }),
      ];

      const now = new Date('2025-01-01T09:50');

      const result = getUpcomingEvents(events, now);

      expect(result).toEqual([events[0]]);
    });

    it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
      const events = [
        createTestEvent({
          title: '팀 회의',
          date: '2025-01-01',
          startTime: '10:00',
          notificationTime: 10,
        }),
      ];

      const now = new Date('2025-01-01T09:49');

      const result = getUpcomingEvents(events, now);

      expect(result).toEqual([]);
    });

    it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
      const events = [
        createTestEvent({
          title: '팀 회의',
          date: '2025-01-01',
          startTime: '10:00',
          notificationTime: 10,
        }),
      ];

      const now = new Date('2025-01-01T12:51');

      const result = getUpcomingEvents(events, now);

      expect(result).toEqual([]);
    });
  });

  describe('이미 알림이 간 이벤트 제외', () => {
    it('이미 알림이 간 이벤트는 결과에서 제외한다', () => {
      const events = [
        createTestEvent({
          id: '1',
          title: '팀 회의',
          date: '2025-01-01',
          startTime: '10:00',
          notificationTime: 10,
        }),
      ];

      const now = new Date('2025-01-01T09:50');
      const notifiedEventIds = ['1'];

      const result = getUpcomingEvents(events, now, notifiedEventIds);

      expect(result).toEqual([]);
    });

    it('알림이 간 이벤트가 없으면 모든 조건을 만족하는 이벤트를 반환한다', () => {
      const events = [
        createTestEvent({
          title: '팀 회의',
          date: '2025-01-01',
          startTime: '10:00',
          notificationTime: 10,
        }),
      ];

      const now = new Date('2025-01-01T09:50');
      const notifiedEventIds: string[] = [];
      const result = getUpcomingEvents(events, now, notifiedEventIds);
      const expected = [
        createTestEvent({
          title: '팀 회의',
          date: '2025-01-01',
          startTime: '10:00',
          notificationTime: 10,
        }),
      ];

      expect(result).toEqual(expected);
    });
  });
});

// describe('createNotificationMessage', () => {
//   it('올바른 알림 메시지를 생성해야 한다', () => {
//     const event = createTestEvent({
//       title: '이벤트 1',
//       date: '2025-01-01',
//       startTime: '10:00',
//       notificationTime: 10,
//     });

//     const result = createNotificationMessage(event);

//     expect(result).toEqual('10분 후 이벤트 1 일정이 시작됩니다.');
//   });
// });
