import { createEvent } from '../__fixture__/eventFactory.ts';

export const caseEvent1 = [
  createEvent({
    title: '이벤트 1',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
  }),
  createEvent({
    title: '이벤트 2',
    date: '2025-07-02',
    startTime: '09:00',
    endTime: '10:00',
  }),
  createEvent({
    title: '이벤트 3',
    date: '2025-07-03',
    startTime: '09:00',
    endTime: '10:00',
  }),
  createEvent({
    title: '이벤트 4',
    date: '2025-05-05',
    startTime: '09:00',
    endTime: '10:00',
  }),
  createEvent({
    title: '이벤트 5',
    date: '2025-06-05',
    startTime: '09:00',
    endTime: '10:00',
  }),
  createEvent({
    title: 'event',
    date: '2025-07-05',
    startTime: '10:00',
    endTime: '11:00',
  }),
];
export const caseEvent2 = [
  createEvent({
    title: 'event1',
    date: '2025-06-30',
    startTime: '10:00',
    endTime: '11:00',
  }),
  createEvent({
    title: 'event2',
    date: '2025-07-01',
    startTime: '10:00',
    endTime: '11:00',
  }),
  createEvent({
    title: 'event3',
    date: '2025-07-31',
    startTime: '10:00',
    endTime: '11:00',
  }),

  createEvent({
    title: 'event4',
    date: '2025-08-01',
    startTime: '10:00',
    endTime: '11:00',
  }),
];
export const caseEvent3 = [
  createEvent({
    title: 'event1',
    date: '2025-06-30',
    startTime: '10:00',
    endTime: '11:00',
    id: '1',
    notificationTime: 1,
  }),
  createEvent({
    title: 'event2',
    date: '2025-07-20',
    startTime: '10:00',
    endTime: '11:00',
    id: '2',
    notificationTime: 1,
  }),
  createEvent({
    title: 'event3',
    date: '2025-06-30',
    startTime: '10:00',
    endTime: '13:00',
    id: '3',
    notificationTime: 1,
  }),
];
