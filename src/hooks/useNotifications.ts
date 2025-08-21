import { useEffect, useRef, useState } from 'react';

import { Event } from '../types';
import { createNotificationMessage, getUpcomingEvents } from '../utils/notificationUtils';

export const useNotifications = (events: Event[]) => {
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);
  const notifiedEventsRef = useRef<string[]>([]);

  const checkUpcomingEvents = () => {
    const now = new Date();
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEventsRef.current);

    if (upcomingEvents.length === 0) return;

    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newNotifications = upcomingEvents
        .filter((e) => !existingIds.has(e.id))
        .map((event) => ({ id: event.id, message: createNotificationMessage(event) }));
      return newNotifications.length > 0 ? [...prev, ...newNotifications] : prev;
    });

    setNotifiedEvents((prev) => {
      const updated = [...prev, ...upcomingEvents.map(({ id }) => id)];
      notifiedEventsRef.current = updated;
      return updated;
    });
  };

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    notifiedEventsRef.current = notifiedEvents;
  }, [notifiedEvents]);

  useEffect(() => {
    const interval = setInterval(checkUpcomingEvents, 1000); // 1초마다 체크
    return () => clearInterval(interval);
  }, [events]);

  return { notifications, notifiedEvents, setNotifications, removeNotification };
};
