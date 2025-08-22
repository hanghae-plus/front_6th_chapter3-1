import { Event } from '../types';
import { getWeekDates, isDateInRange } from './dateUtils';

/**
 * 지정된 날짜 범위 내에 있는 이벤트들을 필터링하여 반환합니다.
 */
function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

/**
 * 문자열에서 검색어가 포함되어 있는지 대소문자 구분 없이 확인합니다.
 */
function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

/**
 * 이벤트 배열에서 제목, 설명, 위치에 검색어가 포함된 이벤트들을 찾아 반환합니다.
 */
function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

/**
 * 주어진 날짜가 속한 주(일요일~토요일) 범위의 이벤트들을 필터링하여 반환합니다.
 */
function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

/**
 * 주어진 날짜가 속한 월 전체 범위의 이벤트들을 필터링하여 반환합니다.
 * 월의 마지막 날 23시 59분 59초까지를 포함합니다.
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

/**
 * 검색어와 뷰 타입(주간/월간)에 따라 이벤트들을 필터링하여 반환합니다.
 * 먼저 검색어로 필터링한 후, 뷰 타입에 따라 날짜 범위를 적용합니다.
 */
export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}
