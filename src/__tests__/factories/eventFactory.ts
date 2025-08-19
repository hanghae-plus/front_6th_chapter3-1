import { randomUUID } from 'crypto';

import { Event } from '../../types';

export const makeEvent = (overrides: Partial<Event> = {}): Event => ({
  id: overrides.id ?? randomUUID(),
  title: '테스트 이벤트',
  date: '2025-10-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '',
  location: '',
  category: '',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
  ...overrides,
});

export const makeEvents = (count: number, mapper: () => Partial<Event> = () => ({})): Event[] =>
  Array.from({ length: count }, (_, i) => makeEvent({ id: `${i + 1}`, ...(mapper?.() ?? {}) }));
