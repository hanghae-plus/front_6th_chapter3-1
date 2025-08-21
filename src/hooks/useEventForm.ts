import { useState, useEffect, ChangeEvent } from 'react';

import { Event } from '../types';

export const useEventForm = (eventToEdit: Event | null) => {
  const getInitialState = (event: Event | null) => ({
    title: event?.title || '',
    date: event?.date || '',
    startTime: event?.startTime || '',
    endTime: event?.endTime || '',
    description: event?.description || '',
    location: event?.location || '',
    category: event?.category || '',
    isRepeating: event?.repeat.type !== 'none',
    repeatType: event?.repeat.type || 'none',
    repeatInterval: event?.repeat.interval || 0,
    repeatEndDate: event?.repeat.endDate || '',
    notificationTime: event?.notificationTime || 1,
  });

  const [formState, setFormState] = useState(getInitialState(eventToEdit));

  useEffect(() => {
    setFormState(getInitialState(eventToEdit));
  }, [eventToEdit]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormState(getInitialState(null));
  };

  return { formState, handleChange, resetForm };
};
