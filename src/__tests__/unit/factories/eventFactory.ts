import type { Event } from '../../../types';

export function createEventData(data: Partial<Event>): Event {
  return {
    id: '',
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    location: '',
    category: '',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 1,
    ...data,
  };
}
