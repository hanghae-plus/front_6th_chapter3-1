import { NOTIFICATION_OPTIONS } from '../constants/notification';
import { Event } from '../types';
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

/**
 * 검색된 이벤트를 주간 뷰 또는 월간 뷰에 맞게 필터링
 * @param events 이벤트 배열
 * @param searchTerm 검색어
 * @param currentDate 현재 날짜
 * @param view 뷰 타입(week, month)
 * @returns 필터링된 이벤트 배열
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

/**
 * 반복 타입 텍스트 반환
 * @param type 반복 타입(daily, weekly, monthly, yearly)
 * @returns 반복 타입 텍스트
 */
export const getRepeatTypeText = (type: Event['repeat']['type']) => {
  const typeMap = { daily: '일', weekly: '주', monthly: '월', yearly: '년' };
  return typeMap[type as keyof typeof typeMap] || '';
};

/**
 * 반복 정보 텍스트 반환
 * @param repeat 반복 정보
 * @returns 반복 정보 텍스트
 */
export const formatRepeatInfo = (repeat: Event['repeat']) => {
  if (repeat.type === 'none') return null;

  const baseText = `반복: ${repeat.interval}${getRepeatTypeText(repeat.type)}마다`;
  return repeat.endDate ? `${baseText} (종료: ${repeat.endDate})` : baseText;
};

/**
 * 알림 텍스트 반환
 * @param notificationTime 알림 시간
 * @returns 알림 텍스트
 */
export const getNotificationLabel = (notificationTime: number) =>
  NOTIFICATION_OPTIONS.find((option) => option.value === notificationTime)?.label || '';
