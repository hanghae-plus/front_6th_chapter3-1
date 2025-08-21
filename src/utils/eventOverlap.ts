import { Event, EventForm } from '../types';

/**
 * 주어진 날짜 문자열과 시간 문자열을 결합하여 ISO형식의 문자열로 만든 뒤 Date객체로 만들어 반환
 * 무조건 UTC기준으로 시간 해석되므로 timezone 고려 필요
 *
 */
export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

/**
 * Event의 날짜와 시작시간, 종료시간을 인자로 받아 {start:Date, end:Date}형태로 변환해 반환
 */
export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
}

/**
 * 첫번째 인자와 두번째 인자로 받은 시간이 겹치는지 확인해 boolean값 반환
 */
export function isOverlapping(event1: Event | EventForm, event2: Event | EventForm) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
}

/** 시간이 겹치는 이벤트가 있으면, 겹치는 이벤트만 필터링해서 반환 */
export function findOverlappingEvents(newEvent: Event | EventForm, events: Event[]) {
  return events.filter(
    (event) => event.id !== (newEvent as Event).id && isOverlapping(event, newEvent)
  );
}
