import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { RepeatType } from '../types';
import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface UseEventSubmitProps {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  editingEvent: Event | null;
  startTimeError: string | null;
  endTimeError: string | null;
  description: string;
  location: string;
  category: string;
  isRepeating: boolean;
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
  notificationTime: number;
  saveEvent: (event: Event) => void;
  resetForm: () => void;
  events: Event[];
}

export const useEventSubmit = ({
  title,
  date,
  startTime,
  endTime,
  editingEvent,
  startTimeError,
  endTimeError,
  description,
  location,
  category,
  isRepeating,
  repeatType,
  repeatInterval,
  repeatEndDate,
  notificationTime,
  saveEvent,
  resetForm,
  events,
}: UseEventSubmitProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventForm = {
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
    };

    const overlapping = findOverlappingEvents(eventData, events);

    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData as Event);
      resetForm();
    }
  };

  const closeOverlapDialog = () => {
    setIsOverlapDialogOpen(false);
  };

  return {
    addOrUpdateEvent,
    isOverlapDialogOpen,
    overlappingEvents,
    closeOverlapDialog,
  };
};
