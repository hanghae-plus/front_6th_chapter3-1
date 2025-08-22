import { Close } from '@mui/icons-material';
import { Alert, AlertTitle, IconButton, Stack } from '@mui/material';

interface Notification {
  message: string;
}

interface NotificationStackProps {
  notifications: Notification[];
  onRemoveNotification: (index: number) => void;
}

export default function NotificationStack({
  notifications,
  onRemoveNotification,
}: NotificationStackProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <Stack
      data-testid="notification-stack"
      position="fixed"
      top={16}
      right={16}
      spacing={2}
      alignItems="flex-end"
    >
      {notifications.map((notification, index) => (
        <Alert
          key={index}
          data-testid={`notification-alert-${index}`}
          severity="info"
          sx={{ width: 'auto' }}
          action={
            <IconButton
              data-testid={`notification-close-${index}`}
              size="small"
              onClick={() => onRemoveNotification(index)}
            >
              <Close />
            </IconButton>
          }
        >
          <AlertTitle data-testid={`notification-message-${index}`}>
            {notification.message}
          </AlertTitle>
        </Alert>
      ))}
    </Stack>
  );
}
