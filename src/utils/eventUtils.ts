import { Event } from '../types';
import { notificationOptions } from './constants';
import { getWeekDates, isDateInRange } from './dateUtils';

function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

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
  const searchedEvents = searchEvents(events, searchTerm);

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}

// 심화과제
// 알림 라벨 가져오기
export const getNotificationLabel = (notificationTime: number) => {
  return notificationOptions.find((option) => option.value === notificationTime)?.label;
};

// 반복 정보 포맷팅
export const formatRepeatInfo = (repeat: { type: string; interval: number; endDate?: string }) => {
  if (repeat.type === 'none') return '';

  const typeLabels = {
    daily: '일',
    weekly: '주',
    monthly: '월',
    yearly: '년',
  };

  const typeLabel = typeLabels[repeat.type as keyof typeof typeLabels] || '';
  const endDateInfo = repeat.endDate ? ` (종료: ${repeat.endDate})` : '';

  return `${repeat.interval}${typeLabel}마다${endDateInfo}`;
};
