import { Event } from '../../types';

export const dummyEvent: Event = {
  date: '2025-08-15',
  startTime: '14:00',
  endTime: '15:00',
  id: '1',
  title: 'test',
  description: 'test',
  location: 'test',
  category: 'test',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 10,
};
