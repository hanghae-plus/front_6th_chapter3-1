import { Event } from '../../types';

export const buildEvent = (overrides: Partial<Event> = {}): Event => ({
  id: '1',
  title: 'test',
  date: '2025-01-01',
  startTime: '00:00',
  endTime: '01:00',
  description: 'test',
  location: 'test',
  category: 'test',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
  ...overrides,
});

export const getEventStartDate = (event: Event): Date =>
  new Date(`${event.date}T${event.startTime}`);
