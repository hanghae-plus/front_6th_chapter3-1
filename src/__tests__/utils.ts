import { fillZero } from '../utils/dateUtils';
import { Event } from '../types';

export const assertDate = (date1: Date, date2: Date) => {
  expect(date1.toISOString()).toBe(date2.toISOString());
};

export const parseHM = (timestamp: number) => {
  const date = new Date(timestamp);
  const h = fillZero(date.getHours());
  const m = fillZero(date.getMinutes());
  return `${h}:${m}`;
};

// 이벤트 생성 시 id는 필수로 입력해서 생성하도록 타입 정의
type Overrides = Partial<Event> & { id: string };

export const createTestEvents = (overridesList: Overrides[]): Event[] => {
  return overridesList.map((overrides) => ({
    title: 'Test Event',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
    ...overrides,
  }));
};
