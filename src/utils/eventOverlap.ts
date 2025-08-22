import { Event, EventForm } from '../types';

/**
 * 날짜 문자열과 시간 문자열을 조합하여 Date 객체를 생성합니다.
 */
export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

/**
 * 이벤트 객체를 시작/종료 Date 객체를 포함한 날짜 범위 객체로 변환합니다.
 */
export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
}

/**
 * 두 이벤트의 시간이 겹치는지 확인합니다.
 * 시작 시간이 다른 이벤트의 종료 시간보다 이전이고,
 * 종료 시간이 다른 이벤트의 시작 시간보다 이후일 때 겹치는 것으로 판단합니다.
 */
export function isOverlapping(event1: Event | EventForm, event2: Event | EventForm) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
}

/**
 * 기존 이벤트 배열에서 새 이벤트와 시간이 겹치는 이벤트들을 찾아 반환합니다.
 * 자기 자신(같은 ID)은 제외하고 검사합니다.
 */
export function findOverlappingEvents(newEvent: Event | EventForm, events: Event[]) {
  return events.filter(
    (event) => event.id !== (newEvent as Event).id && isOverlapping(event, newEvent)
  );
}
