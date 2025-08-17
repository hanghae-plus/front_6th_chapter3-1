import { Event, EventForm } from '../types';

/**
 * 날짜 문자열과 시간 문자열을 결합하여 Date 객체를 생성합니다.
 *
 * @param date - 날짜 문자열 (YYYY-MM-DD 형식)
 * @param time - 시간 문자열 (HH:MM 형식)
 * @returns 결합된 Date 객체. 잘못된 형식의 경우 Invalid Date 반환
 *
 * @example
 * parseDateTime('2025-07-01', '14:30') // new Date('2025-07-01T14:30:00')
 * parseDateTime('잘못된날짜', '14:30') // new Date('Invalid Date')
 */
export function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

/**
 * 이벤트의 날짜와 시간 정보를 Date 객체 범위로 변환합니다.
 *
 * @param param0 - 이벤트 객체 (날짜, 시작시간, 종료시간 속성 포함)
 * @returns 시작과 종료 Date 객체를 포함한 범위 객체
 *
 * @example
 * const event = { date: '2025-07-10', startTime: '09:00', endTime: '10:00' };
 * convertEventToDateRange(event)
 * // { start: new Date('2025-07-10T09:00:00'), end: new Date('2025-07-10T10:00:00') }
 */
export function convertEventToDateRange({ date, startTime, endTime }: Event | EventForm) {
  return {
    start: parseDateTime(date, startTime),
    end: parseDateTime(date, endTime),
  };
}

/**
 * 두 이벤트의 시간이 겹치는지 확인합니다.
 *
 * @param event1 - 첫 번째 이벤트
 * @param event2 - 두 번째 이벤트
 * @returns 시간이 겹치는 경우 true, 그렇지 않으면 false
 *
 * @description
 * 두 이벤트의 시간 범위가 겹치는지 확인합니다.
 * 시간 겹침 조건: start1 < end2 && start2 < end1
 *
 * @example
 * const event1 = { date: '2025-07-10', startTime: '12:00', endTime: '13:00' };
 * const event2 = { date: '2025-07-10', startTime: '11:30', endTime: '13:00' };
 * isOverlapping(event1, event2) // true
 */
export function isOverlapping(event1: Event | EventForm, event2: Event | EventForm) {
  const { start: start1, end: end1 } = convertEventToDateRange(event1);
  const { start: start2, end: end2 } = convertEventToDateRange(event2);

  return start1 < end2 && start2 < end1;
}

/**
 * 새 이벤트와 시간이 겹치는 기존 이벤트들을 찾아 반환합니다.
 *
 * @param newEvent - 새로 추가할 이벤트
 * @param events - 기존 이벤트 목록
 * @returns 새 이벤트와 시간이 겹치는 기존 이벤트 배열
 *
 * @description
 * 새 이벤트와 동일한 ID를 가진 이벤트는 비교 대상에서 제외됩니다.
 * (이벤트 수정 시 자기 자신과의 겹침을 방지하기 위함)
 *
 * @example
 * const newEvent = { id: 'new', date: '2025-07-10', startTime: '10:00', endTime: '14:00' };
 * const existingEvents = [{ id: 'existing', date: '2025-07-10', startTime: '12:00', endTime: '13:00' }];
 * findOverlappingEvents(newEvent, existingEvents) // [시간이 겹치는 이벤트들]
 */
export function findOverlappingEvents(newEvent: Event | EventForm, events: Event[]) {
  return events.filter(
    (event) => event.id !== (newEvent as Event).id && isOverlapping(event, newEvent)
  );
}
