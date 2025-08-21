import { Event } from '../types';

const 초 = 1000;
const 분 = 초 * 60;

/** 시간차가 notificationTime보다 적게 남았고, 알림을 완료하지 않은 이벤트만 필터링해서 반환 */
export function getUpcomingEvents(events: Event[], now: Date, notifiedEvents: string[]) {
  return events.filter((event) => {
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    const timeDiff = (eventStart.getTime() - now.getTime()) / 분;
    return timeDiff > 0 && timeDiff <= event.notificationTime && !notifiedEvents.includes(event.id);
  });
}

/** 알림시간과 일정 제목을 인자로 받아 알림 메세지를 생성해 반환 */
export function createNotificationMessage({ notificationTime, title }: Event) {
  return `${notificationTime}분 후 ${title} 일정이 시작됩니다.`;
}
