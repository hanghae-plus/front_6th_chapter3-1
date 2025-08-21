import { useEffect, useState } from 'react';

import { Event } from '../types';
import { createNotificationMessage, getUpcomingEvents } from '../utils/notificationUtils';

export const useNotifications = (events: Event[] = []) => {
  const [notifications, setNotifications] = useState<
    { id: string; message: string; eventId: string }[]
  >([]);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);

  const checkUpcomingEvents = () => {
    const now = new Date();
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    setNotifications((prev) => [
      ...prev,
      ...upcomingEvents.map((event) => ({
        id: event.id,
        eventId: event.id,
        message: createNotificationMessage(event),
      })),
    ]);

    setNotifiedEvents((prev) => [...prev, ...upcomingEvents.map(({ id }) => id)]);
  };

  const addNotification = (event: Event) => {
    // 이미 알림이 있는지 확인
    const existingNotification = notifications.find((n) => n.eventId === event.id);
    if (!existingNotification) {
      setNotifications((prev) => [
        ...prev,
        {
          id: event.id,
          eventId: event.id,
          message: createNotificationMessage(event),
        },
      ]);
    }
  };

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const interval = setInterval(checkUpcomingEvents, 1000); // 1초마다 체크
    return () => clearInterval(interval);
  }, [events, notifiedEvents]);

  return { notifications, notifiedEvents, setNotifications, removeNotification, addNotification };
};
