import { RepeatType } from '../types';
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

// 이벤트 생성
export const createEvent = (id: string, date: string, startTime?: string, endTime?: string) => {
  return {
    id: id,
    title: `event ${id}`,
    date: date,
    startTime: startTime || '09:00',
    endTime: endTime || '10:00',
    description: 'description',
    location: 'location',
    category: 'category',
    repeat: {
      type: 'none' as RepeatType,
      interval: 0,
    },
    notificationTime: 0,
  };
};
