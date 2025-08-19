import { Event, RepeatType } from '../types';
import { fillZero } from '../utils/dateUtils';

export const assertDate = (date1: Date, date2: Date) => {
  // expect(date1.toISOString()).toBe(date2.toISOString());
  expect(date1.toISOString().split('T')[0]).toBe(date2.toISOString().split('T')[0]);
};

export const parseHM = (timestamp: number) => {
  const date = new Date(timestamp);
  const h = fillZero(date.getHours());
  const m = fillZero(date.getMinutes());
  return `${h}:${m}`;
};

// 이벤트 생성
export const createEvent = ({
  id,
  date,
  title,
  startTime,
  endTime,
  notificationTime,
}: Partial<Event>): Event => {
  return {
    id: id || '1',
    date: date || '2025-08-01',
    title: title || `event ${id}`,
    startTime: startTime || '09:00',
    endTime: endTime || '10:00',
    description: 'description',
    location: 'location',
    category: 'category',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: notificationTime || 0,
  };
};
