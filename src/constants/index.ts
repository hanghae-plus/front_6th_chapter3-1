// 요일 배열
export const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

// 카테고리 배열
export const CATEGORIES = ['업무', '개인', '가족', '기타'] as const;

// 알림 옵션
export const NOTIFICATION_OPTIONS = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
] as const;
