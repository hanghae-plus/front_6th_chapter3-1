import { Event } from '../types';

export const defaultMockEvent: Event = {
  id: '1',
  title: '모각코',
  date: '2025-08-21',
  startTime: '10:00',
  endTime: '11:00',
  description: '모각코 스터디',
  location: '카페',
  category: '개인',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 10,
};

export const defaultMockEvents: Event[] = [defaultMockEvent];