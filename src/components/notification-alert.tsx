import { Close } from '@mui/icons-material';
import { Stack, Alert, IconButton, AlertTitle } from '@mui/material';

type Props = {
  notifications: { id: string; message: string }[];
  onCloseNotification: (id: number) => void;
};

export const NotificationAlert = ({ notifications, onCloseNotification }: Props) => {
  if (notifications.length === 0) return null;

  return (
    <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
      {notifications.map((notification, index) => (
        <Alert
          key={index}
          severity="info"
          sx={{ width: 'auto' }}
          action={
            <IconButton size="small" onClick={() => onCloseNotification(index)}>
              <Close />
            </IconButton>
          }
        >
          <AlertTitle>{notification.message}</AlertTitle>
        </Alert>
      ))}
    </Stack>
  );
};
