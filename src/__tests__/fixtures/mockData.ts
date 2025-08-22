import { Event } from '../../types';

// 공통 테스트 데이터 상수
export const TEST_DATES = {
  DEFAULT_DATE: '2024-07-15',
  WEEK_START: '2024-07-14', // 일요일
  MONTH_JULY: '2024-07-01',
  YEAR_END: '2024-12-31',
} as const;

export const TEST_TIMES = {
  MORNING_START: '09:00',
  MORNING_END: '10:00',
  AFTERNOON_START: '14:00',
  AFTERNOON_END: '15:00',
  OVERLAP_START: '10:30',
  OVERLAP_END: '11:30',
} as const;

export const TEST_CATEGORIES = {
  WORK: '업무',
  PERSONAL: '개인',
  FAMILY: '가족',
  OTHER: '기타',
} as const;

// 기본 테스트 이벤트
export const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
  id: '1',
  title: '테스트 이벤트',
  date: TEST_DATES.DEFAULT_DATE,
  startTime: TEST_TIMES.MORNING_START,
  endTime: TEST_TIMES.MORNING_END,
  description: '테스트 설명',
  location: '테스트 장소',
  category: TEST_CATEGORIES.WORK,
  repeat: { type: 'none', interval: 1 },
  notificationTime: 10,
  ...overrides,
});

// 여러 이벤트 데이터
export const createMockEvents = (): Event[] => [
  createMockEvent({
    id: '1',
    title: '회의',
    description: '팀 회의',
    location: '회의실',
    category: TEST_CATEGORIES.WORK,
  }),
  createMockEvent({
    id: '2',
    title: '점심 약속',
    date: '2024-07-16',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심',
    location: '레스토랑',
    category: TEST_CATEGORIES.PERSONAL,
    repeat: { type: 'weekly', interval: 1, endDate: TEST_DATES.YEAR_END },
    notificationTime: 60,
  }),
];

// 겹치는 이벤트 데이터
export const createOverlappingEvents = (): Event[] => [
  createMockEvent({
    id: '1',
    title: '기존 회의',
    startTime: TEST_TIMES.MORNING_START,
    endTime: TEST_TIMES.MORNING_END,
  }),
  createMockEvent({
    id: '2',
    title: '점심 약속',
    startTime: TEST_TIMES.OVERLAP_START,
    endTime: TEST_TIMES.OVERLAP_END,
  }),
];

// 공휴일 데이터
export const createMockHolidays = () => ({
  [TEST_DATES.DEFAULT_DATE]: '광복절',
  '2025-01-01': '신정',
});

// 알림 데이터
export const createMockNotifications = () => [
  { id: '1', message: '회의가 10분 후 시작됩니다.', type: 'info' as const },
  { id: '2', message: '점심 약속을 잊지 마세요!', type: 'warning' as const },
];

// API 응답 형식
export const createApiResponse = <T>(data: T, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error occurred',
});
