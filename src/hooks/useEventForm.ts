import { useState } from 'react';

import { Event, RepeatType } from '../types';

// 폼 데이터 타입
type FormData = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  notificationTime: number;
  isRepeating: boolean;
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
};

const getInitialFormData = (initialEvent?: Event): FormData => ({
  title: initialEvent?.title || '',
  date: initialEvent?.date || '',
  startTime: initialEvent?.startTime || '',
  endTime: initialEvent?.endTime || '',
  description: initialEvent?.description || '',
  location: initialEvent?.location || '',
  category: initialEvent?.category || '업무',
  notificationTime: initialEvent?.notificationTime || 10,
  isRepeating: initialEvent?.repeat.type !== 'none',
  repeatType: initialEvent?.repeat.type || 'none',
  repeatInterval: initialEvent?.repeat.interval || 1,
  repeatEndDate: initialEvent?.repeat.endDate || '',
});

export const useEventFormData = (initialEvent?: Event) => {
  const [formData, setFormData] = useState<FormData>(() => getInitialFormData(initialEvent));
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // 폼 데이터를 Event 형태로 변환하는 헬퍼
  const getEventData = (): Omit<Event, 'id'> => ({
    title: formData.title,
    date: formData.date,
    startTime: formData.startTime,
    endTime: formData.endTime,
    description: formData.description,
    location: formData.location,
    category: formData.category,
    notificationTime: formData.notificationTime,
    repeat: {
      type: formData.isRepeating ? formData.repeatType : 'none',
      interval: formData.repeatInterval,
      ...(formData.repeatEndDate && { endDate: formData.repeatEndDate }),
    },
  });

  // 이벤트 데이터로 폼 필드 설정
  const setEventData = (event: Event) => {
    setFormData({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      description: event.description,
      location: event.location,
      category: event.category,
      notificationTime: event.notificationTime,
      isRepeating: event.repeat.type !== 'none',
      repeatType: event.repeat.type,
      repeatInterval: event.repeat.interval,
      repeatEndDate: event.repeat.endDate || '',
    });
  };

  // 폼 리셋
  const resetFormData = () => {
    setFormData(getInitialFormData());
    setEditingEvent(null);
  };

  return {
    formData,
    setFormData,
    editingEvent,
    setEditingEvent,
    getEventData,
    setEventData,
    resetFormData,
  };
};
