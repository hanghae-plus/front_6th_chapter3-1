import { Event } from '../types';

const 초 = 1000;
const 분 = 초 * 60;

/**
 * 현재 시간을 기준으로 알림을 보내야 하는 이벤트들을 필터링하여 반환합니다.
 *
 * @param events - 전체 이벤트 목록
 * @param now - 현재 시간
 * @param notifiedEventIds - 이미 알림을 보낸 이벤트 ID 목록 (중복 알림 방지용)
 * @returns 알림 조건을 만족하는 이벤트 배열
 *
 * @description
 * 다음 조건을 모두 만족하는 이벤트만 반환합니다:
 * 1. 이벤트 시작 시간이 현재 시간보다 미래여야 함 (timeDiff > 0)
 * 2. 현재 시간과 이벤트 시작 시간의 차이가 설정된 알림 시간 이하여야 함 (timeDiff <= notificationTime)
 * 3. 아직 알림을 보내지 않은 이벤트여야 함 (!notifiedEventIds.includes(event.id))
 *
 * @example
 * // 현재 시간이 09:30이고, 10:00에 시작하는 이벤트의 notificationTime이 60분인 경우
 * const events = [{ id: '1', date: '2025-08-20', startTime: '10:00', notificationTime: 60, ... }];
 * const now = new Date('2025-08-20T09:30:00');
 * const notifiedIds = [];
 *
 * const upcomingEvents = getUpcomingEvents(events, now, notifiedIds);
 * // timeDiff = 30분 (10:00 - 09:30)
 * // 30분 > 0 ✓, 30분 ≤ 60분 ✓, 아직 알림 안 보냄 ✓
 * // 결과: 해당 이벤트가 반환됨
 */
export function getUpcomingEvents(events: Event[], now: Date, notifiedEventIds: string[]) {
  return events.filter((event) => {
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    const timeDiff = (eventStart.getTime() - now.getTime()) / 분;
    return (
      timeDiff > 0 && timeDiff <= event.notificationTime && !notifiedEventIds.includes(event.id)
    );
  });
}

/**
 * 이벤트 정보를 기반으로 알림 메시지를 생성합니다.
 *
 * @param event - 알림 메시지를 생성할 이벤트 객체 (notificationTime과 title 속성 사용)
 * @param event.notificationTime - 이벤트 시작 전 알림 시간 (분 단위)
 * @param event.title - 이벤트 제목
 * @returns 생성된 알림 메시지 문자열
 *
 * @example
 * const event = { notificationTime: 30, title: '팀 회의', ... };
 * const message = createNotificationMessage(event);
 * // 결과: "30분 후 팀 회의 일정이 시작됩니다."
 */
export function createNotificationMessage({ notificationTime, title }: Event) {
  return `${notificationTime}분 후 ${title} 일정이 시작됩니다.`;
}
