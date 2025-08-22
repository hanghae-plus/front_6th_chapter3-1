import { useEffect, useState } from 'react';

import type { Event } from '../types';
import { createNotificationMessage, getUpcomingEvents } from '../utils/notificationUtils';

export const useNotifications = (events: Event[]) => {
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

      setNotifications((prev) => [
        ...prev,
        ...upcomingEvents.map((event) => ({
          id: event.id,
          message: createNotificationMessage(event),
        })),
      ]);

      setNotifiedEvents((prev) => [...prev, ...upcomingEvents.map(({ id }) => id)]);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [events, notifiedEvents]);

  return {
    notifications,
    notifiedEvents,
    setNotifications,
    removeNotification,
  };
};
