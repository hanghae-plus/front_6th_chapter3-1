import { Event } from '../types';
import { fillZero } from '../utils/dateUtils';

export const assertDate = (date1: Date, date2: Date) => {
  expect(date1.toISOString()).toBe(date2.toISOString());
};

export const parseHM = (timestamp: number) => {
  const date = new Date(timestamp);
  const h = fillZero(date.getHours());
  const m = fillZero(date.getMinutes());
  return `${h}:${m}`;
};

export const createEventMock = (overrides: Partial<Event> = {}): Event => {
  return {
    id: overrides.id ?? '1',
    date: overrides.date ?? '2025-08-20',
    title: overrides.title ?? `event 테스트 mock ${overrides.id ?? '1'}`,
    startTime: overrides.startTime ?? '13:00',
    endTime: overrides.endTime ?? '17:00',
    description: overrides.description ?? '테스트 설명',
    location: overrides.location ?? '테스트 위치',
    category: overrides.category ?? '테스트 업무',
    repeat: overrides.repeat ?? { type: 'none', interval: 0 },
    notificationTime: overrides.notificationTime ?? 60,
  };
};
