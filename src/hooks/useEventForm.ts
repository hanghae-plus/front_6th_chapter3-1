import { ChangeEvent, useState } from 'react';

import { Event, RepeatType } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

// 폼 데이터를 하나의 객체로 통합
interface FormData {
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
  repeatEndDate: string;
  notificationTime: number;
}

export const useEventForm = (initialEvent?: Event) => {
  // 모든 폼 상태를 하나의 객체로 통합
  const [formData, setFormData] = useState<FormData>({
    title: initialEvent?.title || '',
    date: initialEvent?.date || '',
    startTime: initialEvent?.startTime || '',
    endTime: initialEvent?.endTime || '',
    description: initialEvent?.description || '',
    location: initialEvent?.location || '',
    category: initialEvent?.category || '업무',
    isRepeating: initialEvent?.repeat.type !== 'none',
    repeatType: initialEvent?.repeat.type || 'none',
    repeatInterval: initialEvent?.repeat.interval || 1,
    repeatEndDate: initialEvent?.repeat.endDate || '',
    notificationTime: initialEvent?.notificationTime || 10,
  });

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  // 폼 데이터 업데이트 함수
  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    updateFormData({ startTime: newStartTime });
    setTimeError(getTimeErrorMessage(newStartTime, formData.endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    updateFormData({ endTime: newEndTime });
    setTimeError(getTimeErrorMessage(formData.startTime, newEndTime));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
      location: '',
      category: '업무',
      isRepeating: false,
      repeatType: 'none',
      repeatInterval: 1,
      repeatEndDate: '',
      notificationTime: 10,
    });
  };

  const editEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      description: event.description,
      location: event.location,
      category: event.category,
      isRepeating: event.repeat.type !== 'none',
      repeatType: event.repeat.type,
      repeatInterval: event.repeat.interval,
      repeatEndDate: event.repeat.endDate || '',
      notificationTime: event.notificationTime,
    });
  };

  return {
    // 폼 데이터와 업데이트 함수
    formData,
    updateFormData,

    // 개별 필드 접근을 위한 getter (기존 코드와의 호환성을 위해)
    title: formData.title,
    setTitle: (title: string) => updateFormData({ title }),
    date: formData.date,
    setDate: (date: string) => updateFormData({ date }),
    startTime: formData.startTime,
    setStartTime: (startTime: string) => updateFormData({ startTime }),
    endTime: formData.endTime,
    setEndTime: (endTime: string) => updateFormData({ endTime }),
    description: formData.description,
    setDescription: (description: string) => updateFormData({ description }),
    location: formData.location,
    setLocation: (location: string) => updateFormData({ location }),
    category: formData.category,
    setCategory: (category: string) => updateFormData({ category }),
    isRepeating: formData.isRepeating,
    setIsRepeating: (isRepeating: boolean) => updateFormData({ isRepeating }),
    repeatType: formData.repeatType,
    setRepeatType: (repeatType: RepeatType) => updateFormData({ repeatType }),
    repeatInterval: formData.repeatInterval,
    setRepeatInterval: (repeatInterval: number) => updateFormData({ repeatInterval }),
    repeatEndDate: formData.repeatEndDate,
    setRepeatEndDate: (repeatEndDate: string) => updateFormData({ repeatEndDate }),
    notificationTime: formData.notificationTime,
    setNotificationTime: (notificationTime: number) => updateFormData({ notificationTime }),

    // 에러 상태와 기타 함수들
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  };
};
