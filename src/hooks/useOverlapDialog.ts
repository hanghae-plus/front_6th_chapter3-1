import { useCallback, useState } from 'react';

import type { Event as CalendarEvent } from '../types';

export const useOverlapDialog = () => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<CalendarEvent[]>([]);

  const openOverlapDialog = useCallback((events: CalendarEvent[]) => {
    setOverlappingEvents(events);
    setIsOverlapDialogOpen(true);
  }, []);

  const closeOverlapDialog = useCallback(() => {
    setIsOverlapDialogOpen(false);
  }, []);

  return {
    isOverlapDialogOpen,
    overlappingEvents,
    openOverlapDialog,
    closeOverlapDialog,
  };
};
