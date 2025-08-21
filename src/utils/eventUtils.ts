import { Event } from '../types';
import { getWeekDates, isDateInRange } from './dateUtils';

/** 첫번째인자(events) 중 start~date기간 내에 속한 이벤트를 필터링 후 반환 */
function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

/** 첫번째 인자(문자열)가 두번째 인자(문자열)를 포함했는지 여부를 boolean값으로 반환 */
function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toㅅLowerCase());
}

/** 이벤트의 제목/설명장소에 term이 포함되어 있는 이벤트만 필터링하여 반환 */
function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

/** 현재 주에 해당 하는 weekdates에 열리는 이벤트를 필터링하여 반환 */
function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

/** 현재 달에 해당 하는 이벤트를 필터링하여 반환 */
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

/** term으로 이벤트 검색 및 '보기'단위에 맞는 이벤트를 필터링해서 반환 */
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
