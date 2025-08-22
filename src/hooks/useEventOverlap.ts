import { useState } from 'react';

import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

export const useEventOverlap = () => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const checkAndHandleOverlap = async (
    eventData: Event | EventForm,
    events: Event[],
    onSave: (data: Event | EventForm) => Promise<void>, // eslint-disable-line no-unused-vars
    onReset: () => void
  ): Promise<boolean> => {
    const overlapping = findOverlappingEvents(eventData, events);

    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      return true; // 중복 있음
    }

    await onSave(eventData);
    onReset();
    return false; // 중복 없음
  };

  const closeOverlapDialog = () => setIsOverlapDialogOpen(false);

  return {
    isOverlapDialogOpen,
    overlappingEvents,
    checkAndHandleOverlap,
    closeOverlapDialog,
  };
};
