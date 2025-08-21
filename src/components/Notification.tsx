import { Close } from '@mui/icons-material';
import { Alert, AlertTitle, IconButton, Stack } from '@mui/material';

interface Notification {
  message: string;
}

interface NotificationProps {
  notifications: Notification[];
  onRemoveNotification: (index: number) => void;
}

export function Notification({ notifications, onRemoveNotification }: NotificationProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
      {notifications.map((notification, index) => (
        <Alert
          key={index}
          severity="info"
          sx={{ width: 'auto' }}
          action={
            <IconButton size="small" onClick={() => onRemoveNotification(index)}>
              <Close />
            </IconButton>
          }
        >
          <AlertTitle>{notification.message}</AlertTitle>
        </Alert>
      ))}
    </Stack>
  );
}
