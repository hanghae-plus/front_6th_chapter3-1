import { Close } from '@mui/icons-material';
import { Alert, AlertTitle, IconButton, Stack } from '@mui/material';

interface Notification {
  id: string;
  message: string;
}

interface NotificationToastProps {
  notifications: Notification[];
  setNotifications: (updater: (prev: Notification[]) => Notification[]) => void;
}

export function NotificationToast({ notifications, setNotifications }: NotificationToastProps) {
  if (notifications.length === 0) {
    return null;
  }

  const handleClose = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
      {notifications.map((notification, index) => (
        <Alert
          key={notification.id}
          severity="info"
          sx={{ width: 'auto' }}
          action={
            <IconButton size="small" onClick={() => handleClose(index)}>
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
