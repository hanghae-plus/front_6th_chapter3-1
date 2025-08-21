import { useCallback, useState } from 'react';

import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

export function useOverlapGuard(events: Event[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const checkAndOpen = useCallback(
    (candidate: Event | EventForm): boolean => {
      const overlaps = findOverlappingEvents(candidate, events);
      if (overlaps.length > 0) {
        setOverlappingEvents(overlaps);
        setIsOpen(true);
        return true;
      }
      return false;
    },
    [events]
  );

  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, overlappingEvents, checkAndOpen, close };
}
