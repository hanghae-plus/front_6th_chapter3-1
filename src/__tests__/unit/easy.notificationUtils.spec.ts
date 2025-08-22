import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import { METTING_0823 } from '../mockEvents';
describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-08-23T13:50:00');

    expect(getUpcomingEvents([METTING_0823], now, [])).toEqual([METTING_0823]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-08-23T13:50:00');

    expect(getUpcomingEvents([METTING_0823], now, [METTING_0823.id])).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    // 알림 울리기 1분전 세팅
    const now = new Date('2025-08-23T13:49:00');

    expect(getUpcomingEvents([METTING_0823], now, [])).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-08-23T14:00:00');

    expect(getUpcomingEvents([METTING_0823], now, [])).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const notificationTime = METTING_0823.notificationTime;
    const title = METTING_0823.title;

    expect(createNotificationMessage(METTING_0823)).toBe(
      `${notificationTime}분 후 ${title} 일정이 시작됩니다.`
    );
  });
});
