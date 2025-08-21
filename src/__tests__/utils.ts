import { fillZero } from '../utils/dateUtils';
import { Event } from '../types';
import events from '../__mocks__/response/events.json';

export const assertDate = (date1: Date, date2: Date) => {
  expect(date1.toISOString()).toBe(date2.toISOString());
};

export const parseHM = (timestamp: number) => {
  const date = new Date(timestamp);
  const h = fillZero(date.getHours());
  const m = fillZero(date.getMinutes());
  return `${h}:${m}`;
};

export const createTestEvent = (overrides: Partial<Event> = {}): Event => {
  const baseEvent = events.events[0];

  return {
    ...baseEvent,
    ...overrides,
  } as Event;
};
