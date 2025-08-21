import { Event } from '../types';

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

export interface EventDisplayInfo {
  isNotified: boolean;
  notificationLabel: string;
  repeatText: string;
}

export function getEventDisplayInfo(event: Event, notifiedEvents: string[]): EventDisplayInfo {
  const isNotified = notifiedEvents.includes(event.id);

  const notificationLabel =
    notificationOptions.find((option) => option.value === event.notificationTime)?.label ||
    '알림 없음';

  let repeatText = '';
  if (event.repeat.type !== 'none') {
    const typeLabels = {
      daily: '일',
      weekly: '주',
      monthly: '월',
      yearly: '년',
    };

    repeatText = `반복: ${event.repeat.interval}${typeLabels[event.repeat.type]}마다`;

    if (event.repeat.endDate) {
      repeatText += ` (종료: ${event.repeat.endDate})`;
    }
  }

  return {
    isNotified,
    notificationLabel,
    repeatText,
  };
}

export function getEventCellStyle(isNotified: boolean) {
  return {
    p: 0.5,
    my: 0.5,
    backgroundColor: isNotified ? '#ffebee' : '#f5f5f5',
    borderRadius: 1,
    fontWeight: isNotified ? 'bold' : 'normal',
    color: isNotified ? '#d32f2f' : 'inherit',
    minHeight: '18px',
    width: '100%',
    overflow: 'hidden',
  };
}
