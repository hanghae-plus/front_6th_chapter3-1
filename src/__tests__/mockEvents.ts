import { Event } from '../types';

const METTING_0823: Event = {
  id: '1',
  title: '주간 회의',
  date: '2025-08-23',
  startTime: '14:00',
  endTime: '15:00',
  description: '주간 회의~',
  location: 'A103',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};
const LUNCH_0822: Event = {
  id: '2',
  title: '점심 약속',
  date: '2025-08-22',
  startTime: '12:00',
  endTime: '13:00',
  description: '친구랑 점심 약속~',
  location: '롯데리아',
  category: '개인',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};
const MEETING_0829: Event = {
  id: '3',
  title: '월간 회의',
  date: '2025-08-29',
  startTime: '14:00',
  endTime: '15:00',
  description: '월간 마무리 회의~',
  location: 'A104',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 30,
};
const LUNCH_0828: Event = {
  id: '4',
  title: '점심 데이트',
  date: '2025-08-28',
  startTime: '12:00',
  endTime: '13:00',
  description: '친구랑 점심 데이트, 후딱 먹고 회의가야함',
  location: '버거킹',
  category: '개인',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 30,
};
const MEETING_0926: Event = {
  id: '5',
  title: '9월 월간 회의',
  date: '2025-09-26',
  startTime: '14:00',
  endTime: '15:00',
  description: '9월 월간 회의~',
  location: 'A104',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 30,
};
const LUNCH_0904: Event = {
  id: '6',
  title: '9월 점심 약속',
  date: '2025-09-04',
  startTime: '12:00',
  endTime: '13:00',
  description: '9월 점심 약속~',
  location: '야외 카페',
  category: '개인',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 30,
};
const MOCK_EVENTS: Event[] = [
  METTING_0823,
  LUNCH_0822,
  MEETING_0829,
  LUNCH_0828,
  MEETING_0926,
  LUNCH_0904,
];

export {
  MOCK_EVENTS,
  METTING_0823,
  LUNCH_0822,
  MEETING_0829,
  LUNCH_0828,
  MEETING_0926,
  LUNCH_0904,
};
