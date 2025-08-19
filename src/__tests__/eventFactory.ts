import { randomUUID } from 'crypto';
import { Event, EventForm } from '../types';
import { generateEndTimeAfterStart, getRandomDate, getRandomTime } from './utils';

const categories = ['회의', '개인', '업무', '학습', '기타'];
const locations = ['회의실 A', '회의실 B', '홈오피스', '카페', '온라인'];

// 이벤트 폼
export const createEventForm = (override: Partial<EventForm> = {}): EventForm => {
  const startTime = getRandomTime();
  const endTime = generateEndTimeAfterStart(startTime);

  const defaults: EventForm = {
    title: `테스트 이벤트 ${randomUUID()}`,
    date: getRandomDate(),
    startTime,
    endTime,
    description: '',
    location: locations[Math.floor(Math.random() * locations.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    repeat: { type: 'none', interval: 0 },
    notificationTime: Math.floor(Math.random() * 60) + 1, // 1-60분
  };

  return { ...defaults, ...override };
};

// 이벤트 (id 포함)
export const createEvent = (override: Partial<Event> = {}): Event => {
  const eventFormDefaults = createEventForm();
  const defaults: Event = {
    id: override.id || randomUUID(),
    ...eventFormDefaults,
  };

  return { ...defaults, ...override };
};

// 목록
export const createEvents = (
  overrides: number | Partial<Event>[] = 0
): Event[] => {
  if (typeof overrides === 'number') {
    return Array.from({ length: overrides }, () => {
      return createEvent();
    });
  }

  return overrides.map((override) => {
    return createEvent(override as Partial<Event>);
  });
};