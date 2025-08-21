import { useState } from 'react';

import { Event } from '../types';

export const useOverlapDialog = () => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const openOverlapDialog = (events: Event[]) => {
    setOverlappingEvents(events);
    setIsOverlapDialogOpen(true);
  };

  const closeOverlapDialog = () => {
    setIsOverlapDialogOpen(false);
  };

  return {
    isOverlapDialogOpen,
    overlappingEvents,
    openOverlapDialog,
    closeOverlapDialog,
  };
};