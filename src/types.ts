export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export enum CalendarViewType {
  WEEK = 'week',
  MONTH = 'month',
}

export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
}

export interface EventForm {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number; // 분 단위로 저장
}

export interface Event extends EventForm {
  id: string;
}
