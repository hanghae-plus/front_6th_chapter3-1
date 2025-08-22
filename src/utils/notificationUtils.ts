import { Event } from '../types';

const 초 = 1000;
const 분 = 초 * 60;

/**
 * 현재 시점에서 알림이 필요한 다가오는 이벤트들을 필터링하여 반환합니다.
 * @param events - 전체 이벤트 배열
 * @param now - 현재 시간
 * @param notifiedEvents - 이미 알림이 전송된 이벤트 ID 배열
 * @returns 알림이 필요한 이벤트 배열
 */
export function getUpcomingEvents(events: Event[], now: Date, notifiedEvents: string[]) {
  return events.filter((event) => {
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    const timeDiff = (eventStart.getTime() - now.getTime()) / 분;
    return timeDiff > 0 && timeDiff <= event.notificationTime && !notifiedEvents.includes(event.id);
  });
}

/**
 * 이벤트 정보를 바탕으로 알림 메시지를 생성합니다.
 * @param event - 알림 메시지를 생성할 이벤트 객체 (notificationTime, title 속성 사용)
 * @returns 생성된 알림 메시지 문자열
 */
export function createNotificationMessage({ notificationTime, title }: Event) {
  return `${notificationTime}분 후 ${title} 일정이 시작됩니다.`;
}
