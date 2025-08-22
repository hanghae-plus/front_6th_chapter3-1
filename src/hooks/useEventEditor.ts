import { Event } from '../types';
import { useState } from 'react';

export const useEventEditor = () => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  return {
    editingEvent,
    setEditingEvent,
  };
};
