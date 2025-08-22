import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { Event, EventForm as EventFormType, RepeatType } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface UseEventManagementProps {
  events: Event[];
  saveEvent: (event: Event | EventFormType) => Promise<void>;
  resetForm: () => void;
  formData: {
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
    startTimeError: string;
    endTimeError: string;
    editingEvent: Event | null;
  };
}

export const useEventManagement = ({
  events,
  saveEvent,
  resetForm,
  formData,
}: UseEventManagementProps) => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const createEventData = (): Event | EventFormType => ({
    id: formData.editingEvent ? formData.editingEvent.id : undefined,
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

  const validateForm = (): boolean => {
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return false;
    }

    if (formData.startTimeError || formData.endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return false;
    }

    return true;
  };

  const addOrUpdateEvent = async () => {
    if (!validateForm()) return;

    const eventData = createEventData();
    const overlapping = findOverlappingEvents(eventData, events);

    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  const handleOverlapConfirm = async () => {
    setIsOverlapDialogOpen(false);
    const eventData = createEventData();
    await saveEvent(eventData);
    resetForm();
  };

  const closeOverlapDialog = () => {
    setIsOverlapDialogOpen(false);
  };

  return {
    isOverlapDialogOpen,
    overlappingEvents,
    addOrUpdateEvent,
    handleOverlapConfirm,
    closeOverlapDialog,
  };
};
