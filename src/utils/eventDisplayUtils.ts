import { Event } from '../types';

export const getNotificationText = (notificationTime: number): string => {
  switch (notificationTime) {
    case 1:
      return '1분 전';
    case 10:
      return '10분 전';
    case 60:
      return '1시간 전';
    case 120:
      return '2시간 전';
    case 1440:
      return '1일 전';
    default:
      return '';
  }
};

export const getRepeatText = (repeat: Event['repeat']): string => {
  if (repeat.type === 'none') return '';

  const typeText = {
    daily: '일',
    weekly: '주',
    monthly: '월',
    yearly: '년',
  }[repeat.type];

  let text = `반복: ${repeat.interval}${typeText}마다`;
  if (repeat.endDate) {
    text += ` (종료: ${repeat.endDate})`;
  }
  return text;
};
