import { Event } from '../types';
import { getWeekDates, isDateInRange } from './dateUtils';

/**
 * 주어진 날짜 범위 내에 있는 이벤트들을 필터링합니다.
 *
 * @param events - 필터링할 이벤트 배열
 * @param start - 시작 날짜
 * @param end - 종료 날짜
 * @returns 날짜 범위 내의 이벤트 배열
 */
function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

/**
 * 대상 문자열이 검색어를 포함하는지 대소문자 구분 없이 확인합니다.
 *
 * @param target - 검색 대상 문자열
 * @param term - 검색어
 * @returns 검색어 포함 여부
 */
function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

/**
 * 이벤트의 제목, 설명, 위치에서 검색어를 포함하는 이벤트들을 필터링합니다.
 *
 * @param events - 검색할 이벤트 배열
 * @param term - 검색어
 * @returns 검색어를 포함하는 이벤트 배열
 */
function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

/**
 * 주어진 날짜가 속한 주의 범위에 해당하는 이벤트들을 필터링합니다.
 * 주는 일요일부터 토요일까지로 계산됩니다.
 *
 * @param events - 필터링할 이벤트 배열
 * @param currentDate - 기준 날짜
 * @returns 해당 주에 속하는 이벤트 배열
 */
function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

/**
 * 주어진 날짜가 속한 월의 범위에 해당하는 이벤트들을 필터링합니다.
 *
 * @param events - 필터링할 이벤트 배열
 * @param currentDate - 기준 날짜
 * @returns 해당 월에 속하는 이벤트 배열
 */
function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return filterEventsByDateRange(events, monthStart, monthEnd);
}

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const copiedEvents = [...events];

  const searchedEvents = searchEvents(copiedEvents, searchTerm);

  if (searchTerm.trim() === '') {
    return searchedEvents;
  }

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}
