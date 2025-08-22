import { useState } from 'react';

import { Event } from '../types';

export const useEventEditor = () => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  return {
    editingEvent,
    setEditingEvent,
  };
};
