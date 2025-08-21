import { useEffect, useState } from 'react';

import { Event } from '../types';
import { createNotificationMessage, getUpcomingEvents } from '../utils/notificationUtils';

/**
 * 알림 훅
 * - 예정된 이벤트를 주기적으로 확인하고 알림 생성
 * - 이미 알림이 발생한 이벤트는 중복 알림 방지
 * @description notifications: 알림 목록
 * @description notifiedEvents: 알림이 발생한 이벤트 목록
 * @description checkUpcomingEvents: 예정된 이벤트를 확인하고 알림 생성
 * @description removeNotification: 알림 제거
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, notifiedEvents]);

  return { notifications, notifiedEvents, setNotifications, removeNotification };
};
