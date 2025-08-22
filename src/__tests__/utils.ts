import { Event } from '../types';
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

// 공통 테스트 데이터
export const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
  id: '1',
  title: '팀 회의',
  date: '2025-01-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '주간 팀 미팅',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
  ...overrides,
});

export const createMockEvents = (): Event[] => [
  createMockEvent(),
  createMockEvent({
    id: '2',
    title: '점심 약속',
    startTime: '12:00',
    endTime: '13:00',
    description: '팀원들과 점심',
    location: '회사 근처 식당',
    category: '개인',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
    notificationTime: 30,
  }),
];
