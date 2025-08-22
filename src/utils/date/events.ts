import { Event } from '../../types';

export function getEventsForDay(events: Event[], date: number): Event[] {
  return events.filter((event) => new Date(event.date).getDate() === date);
}

const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * 주어진 날짜가 특정 범위 내에 있는지 확인합니다.
 */
export function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
  const normalizedDate = stripTime(date);
  const normalizedStart = stripTime(rangeStart);
  const normalizedEnd = stripTime(rangeEnd);

  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
}
