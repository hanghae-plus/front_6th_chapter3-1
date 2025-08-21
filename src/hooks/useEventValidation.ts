import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface UseEventValidationProps {
  events: Event[];
  onSaveEvent: (eventData: Event | EventForm) => Promise<void>;
}

export const useEventValidation = ({ events, onSaveEvent }: UseEventValidationProps) => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [pendingEventData, setPendingEventData] = useState<Event | EventForm | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  const validateAndSaveEvent = async (
    eventData: Event | EventForm,
    validationData: {
      startTimeError: string | null;
      endTimeError: string | null;
    }
  ) => {
    const { title, date, startTime, endTime } = eventData;
    const { startTimeError, endTimeError } = validationData;

    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setPendingEventData(eventData);
      setIsOverlapDialogOpen(true);
    } else {
      await onSaveEvent(eventData);
    }
  };

  const handleConfirmOverlap = async () => {
    if (pendingEventData) {
      await onSaveEvent(pendingEventData);
      setPendingEventData(null);
    }
    setIsOverlapDialogOpen(false);
  };

  const handleCancelOverlap = () => {
    setIsOverlapDialogOpen(false);
    setPendingEventData(null);
  };

  return {
    isOverlapDialogOpen,
    overlappingEvents,
    validateAndSaveEvent,
    handleConfirmOverlap,
    handleCancelOverlap,
  };
};
