import { Event, EventForm } from '../types';

/**
 * 날짜와 시간을 합쳐 Date 객체로 변환한다
 */
export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

/**
 * 이벤트의 date, startTime, endTime을 동일한 날짜의 시작/종료 Date로 변환한다
 */
export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
}

/**
 * 두 이벤트의 시간이 겹치는지 확인한다
 */
export function isOverlapping(event1: Event | EventForm, event2: Event | EventForm) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
}

/**
 * 새 이벤트와 겹치는 모든 이벤트를 반환한다
 */
export function findOverlappingEvents(newEvent: Event | EventForm, events: Event[]) {
  return events.filter(
    (event) => event.id !== (newEvent as Event).id && isOverlapping(event, newEvent)
  );
}
