import { Event, EventForm as EventFormType, RepeatType } from '../types';

interface EventFormData {
  id?: string;
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
  repeatEndDate: string | null;
  notificationTime: number;
}

export const buildEventData = (formData: EventFormData): Event | EventFormType => ({
  id: formData.id,
  title: formData.title,
  date: formData.date,
  startTime: formData.startTime,
  endTime: formData.endTime,
  description: formData.description,
  location: formData.location,
  category: formData.category,
  repeat: {
    type: formData.isRepeating ? formData.repeatType : 'none',
    interval: formData.repeatInterval,
    endDate: formData.repeatEndDate || undefined,
  },
  notificationTime: formData.notificationTime,
});
