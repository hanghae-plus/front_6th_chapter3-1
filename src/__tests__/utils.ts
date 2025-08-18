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
export const createEvent = (date: Date, id: string, title: string) => {
  return {
    id: id,
    title: title,
    date: date.toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
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
