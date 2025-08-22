import { Stack } from '@mui/material';

import { Notification } from './Notification';

type NotificationData = {
  id: string;
  message: string;
};

type NotificationPanelProps = {
  notifications: NotificationData[];
  onRemove: (index: number) => void;
};

export function NotificationPanel({ notifications, onRemove }: NotificationPanelProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
      {notifications.map((notification, index) => (
        <Notification key={index} message={notification.message} onRemove={() => onRemove(index)} />
      ))}
    </Stack>
  );
}
