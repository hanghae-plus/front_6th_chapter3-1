import { Event } from '../../types.ts';
export const createEvent = (
  overrides: Partial<{
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    id?: string;
    notificationTime?: number;
    description?: string;
  }>
): Event => {
  return {
    id: '',
    title: '기본 이벤트',
    date: '2025-05-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '기본 설명',
    location: '기본 위치',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
    ...overrides,
  };
};

export const factoriesEvents = [
  createEvent({
    id: '1',
    title: '기존 회의',
    date: '2025-05-01',
    startTime: '09:00',
    endTime: '10:00',
  }),
  createEvent({
    id: '2',
    title: '점심 약속',
    date: '2025-05-02',
    startTime: '12:00',
    endTime: '13:00',
  }),
] as Event[];

export const overlapingEvents = [
  createEvent({
    id: '1',
    title: '기존 회의',
    date: '2025-05-02',
    startTime: '09:00',
    endTime: '10:00',
  }),
  createEvent({
    id: '2',
    title: '점심 약속',
    date: '2025-05-02',
    startTime: '09:00',
    endTime: '10:00',
  }),
] as Event[];
