import { useState } from 'react';

import { Event } from '../types';

export const useEventFormData = (initialEvent?: Event) => {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [date, setDate] = useState(initialEvent?.date || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [category, setCategory] = useState(initialEvent?.category || '업무');
  const [notificationTime, setNotificationTime] = useState(initialEvent?.notificationTime || 10);

  const resetEventForm = () => {
    setTitle('');
    setDate('');
    setDescription('');
    setLocation('');
    setCategory('업무');
    setNotificationTime(10);
  };

  const updateEditEventForm = (event: Event) => {
    setTitle(event.title);
    setDate(event.date);
    setDescription(event.description);
    setLocation(event.location);
    setCategory(event.category);
    setNotificationTime(event.notificationTime);
  };

  return {
    title,
    setTitle,
    date,
    setDate,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    notificationTime,
    setNotificationTime,
    resetEventForm,
    updateEditEventForm,
  };
};
