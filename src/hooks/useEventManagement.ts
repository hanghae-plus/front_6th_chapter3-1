import { useState } from 'react';

import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface UseEventManagementProps {
  isEditing: boolean;
  onEditComplete: () => void;
}

export function useEventManagement({ onEditComplete }: UseEventManagementProps) {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [pendingEventData, setPendingEventData] = useState<Event | EventForm | null>(null);

  const handleSaveEvent = async (
    eventData: Event | EventForm,
    events: Event[],
    saveEvent: (data: Event | EventForm) => Promise<void>
  ) => {
    const overlapping = findOverlappingEvents(eventData, events);

    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setPendingEventData(eventData);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      onEditComplete();
    }
  };

  const handleOverlapConfirm = async (saveEvent: (data: Event | EventForm) => Promise<void>) => {
    if (pendingEventData) {
      await saveEvent(pendingEventData);
      onEditComplete();
    }
    setIsOverlapDialogOpen(false);
    setPendingEventData(null);
    setOverlappingEvents([]);
  };

  const handleOverlapCancel = () => {
    setIsOverlapDialogOpen(false);
    setPendingEventData(null);
    setOverlappingEvents([]);
  };

  return {
    isOverlapDialogOpen,
    overlappingEvents,
    handleSaveEvent,
    handleOverlapConfirm,
    handleOverlapCancel,
  };
}
