import { useState } from 'react';

import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

export const useOverlapCheck = () => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [pendingEventData, setPendingEventData] = useState<Event | EventForm | null>(null);

  const checkForOverlap = (eventData: Event | EventForm, events: Event[]) => {
    const overlapping = findOverlappingEvents(eventData, events);

    if (overlapping.length > 0) {
      setPendingEventData(eventData);
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      return { hasOverlap: true, overlappingEvents: overlapping };
    }

    return { hasOverlap: false, overlappingEvents: [] };
  };

  const handleContinueWithOverlap = () => {
    if (pendingEventData) {
      setIsOverlapDialogOpen(false);
      const eventData = pendingEventData;
      setPendingEventData(null);
      return eventData; // 중복을 무시하고 진행할 이벤트 데이터 반환
    }
    return null;
  };

  const closeOverlapDialog = () => {
    setIsOverlapDialogOpen(false);
    setPendingEventData(null);
  };

  return {
    isOverlapDialogOpen,
    overlappingEvents,
    checkForOverlap,
    handleContinueWithOverlap,
    closeOverlapDialog,
  };
};
