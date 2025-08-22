import { Event } from '../types';

const second = 1000;
const minute = second * 60;

export function getUpcomingEvents(events: Event[], now: Date, notifiedEvents: string[]) {
  return events.filter((event) => {
    const eventStart = new Date(`${event.date}T${event.startTime}`);
    const timeDiff = (eventStart.getTime() - now.getTime()) / minute;
    
    // Round to 2 decimal places to avoid floating point inaccuracies
    const roundedTimeDiff = Math.round(timeDiff * 100) / 100;

    return roundedTimeDiff > 0 && roundedTimeDiff <= event.notificationTime && !notifiedEvents.includes(event.id);
  });
}

export function createNotificationMessage({ notificationTime, title }: Event) {
  return `${notificationTime}분 후 ${title} 일정이 시작됩니다.`;
}