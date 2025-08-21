import { Stack } from '@mui/material';
import NotificationItem from './NotificationItem';

interface NotificationContainerProps {
  notifications: Array<{ message: string }>;
  onRemoveNotification: (index: number) => void;
}

export default function NotificationContainer({
  notifications,
  onRemoveNotification,
}: NotificationContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
      {notifications.map((notification, index) => (
        <NotificationItem
          key={index}
          message={notification.message}
          onClose={() => onRemoveNotification(index)}
        />
      ))}
    </Stack>
  );
}
