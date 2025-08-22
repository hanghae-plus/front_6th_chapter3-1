import { useEffect, useState } from 'react';

import { Event } from '../types';
import { createNotificationMessage, getUpcomingEvents } from '../utils/notificationUtils';

/**
 * 일정 알림 시스템을 관리하는 훅
 * 이벤트 배열을 받아서 현재 시간 기준으로 알림이 필요한 이벤트들을 감지하고 알림을 생성/관리
 */
export const useNotifications = (events: Event[]) => {
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);

  const checkUpcomingEvents = () => {
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
  };

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const interval = setInterval(checkUpcomingEvents, 1000); // 1초마다 체크
    return () => clearInterval(interval);
  }, [events, notifiedEvents]);

  return { notifications, notifiedEvents, setNotifications, removeNotification };
};
