import { Event } from '../types';

const 초 = 1000;
const 분 = 초 * 60;

/**
 * 현재 시각 기준으로 알림을 보내야 할 이벤트를 반환
 *
 * @param events 이벤트 목록
 * @param now 현재 시간
 * @param notifiedEvents 이미 알림을 보낸 이벤트 ID 목록
 * @returns 알림 대상 이벤트 목록
 */
export function getUpcomingEvents(events: Event[], now: Date, notifiedEvents: string[]) {
  return events.filter((event) => {
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    const timeDiff = (eventStart.getTime() - now.getTime()) / 분;

    // 이벤트 시작 전이고, 알림 시간 내에 있는 경우만 포함
    return timeDiff > 0 && timeDiff <= event.notificationTime && !notifiedEvents.includes(event.id);
  });
}

/**
 * 알림 메시지를 생성
 *
 * @param notificationTime 알림 시간
 * @param title 이벤트 제목
 * @returns 알림 메시지({notificationTime}분 후 {title} 일정이 시작됩니다.)
 */
export function createNotificationMessage({ notificationTime, title }: Event) {
  return `${notificationTime}분 후 ${title} 일정이 시작됩니다.`;
}
