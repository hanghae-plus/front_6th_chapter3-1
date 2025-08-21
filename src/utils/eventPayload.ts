import { Event, EventForm, RepeatType } from '../types';

interface BuildEventParams {
  editingEvent: Event | null;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  isRepeating: boolean;
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate?: string | null;
  notificationTime: number;
}

export function buildEventData(params: BuildEventParams): Event | EventForm {
  const {
    editingEvent,
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    isRepeating,
    repeatType,
    repeatInterval,
    repeatEndDate,
    notificationTime,
  } = params;

  return {
    id: editingEvent ? editingEvent.id : undefined,
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    repeat: {
      type: isRepeating ? repeatType : 'none',
      interval: repeatInterval,
      endDate: repeatEndDate || undefined,
    },
    notificationTime,
  } as Event | EventForm;
}
