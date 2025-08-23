import { randomUUID } from 'crypto';
import { Event } from '../types';

const testEventMap = new Map<string, Event[]>();

export const testContext = {
  create: (initEvents: Event[] = []): string => {
    const testId = randomUUID();
    testEventMap.set(testId, JSON.parse(JSON.stringify(initEvents)));
    return testId;
  },

  getEvents: (testId: string): Event[] => {
    return testEventMap.get(testId) || [];
  },

  addEvent: (testId: string, event: Event): void => {
    const events = testEventMap.get(testId);
    if (events) events.push(event);
  },

  updateEvent: (testId: string, eventId: string, updatedEvent: Omit<Event, 'id'>): Event | null => {
    const events = testEventMap.get(testId);
    if (!events) return null;

    const index = events.findIndex((event) => event.id === eventId);
    if (index === -1) return null;

    events[index] = { ...updatedEvent, id: eventId };
    return events[index];
  },

  deleteEvent: (testId: string, eventId: string): boolean => {
    const events = testEventMap.get(testId);
    if (!events) return false;

    const index = events.findIndex((event) => event.id === eventId);
    if (index === -1) return false;

    events.splice(index, 1);
    return true;
  },

  cleanup: (testId: string): void => {
    testEventMap.delete(testId);
  },

  cleanupAll: (): void => {
    testEventMap.clear();
  },
};
