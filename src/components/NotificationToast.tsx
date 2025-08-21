import { Close } from '@mui/icons-material';
import { Alert, AlertTitle, IconButton, Stack } from '@mui/material';

interface NotificationToastProps {
  notifications: { id: string; message: string }[];
  removeNotification: (index: number) => void;
}

export const NotificationToast = ({
  notifications,
  removeNotification,
}: NotificationToastProps) => {
  return (
    <>
      {notifications.length > 0 && (
        <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
          {notifications.map((notification, index) => (
            <Alert
              key={index}
              severity="info"
              sx={{ width: 'auto' }}
              action={
                <IconButton size="small" onClick={() => removeNotification(index)}>
                  <Close />
                </IconButton>
              }
            >
              <AlertTitle>{notification.message}</AlertTitle>
            </Alert>
          ))}
        </Stack>
      )}
    </>
  );
};
