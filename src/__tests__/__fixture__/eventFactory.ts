import { Event } from '../../types.ts';

export const factoriesEvents = [
  {
    id: '1',
    title: '기존 회의',
    date: '2025-05-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-05-02',
    startTime: '12:00',
    endTime: '13:00',
    description: '동료와 점심',
    location: '식당',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  },
] as Event[];
