import { Alert, AlertTitle, IconButton, Stack } from '@mui/material';
import { Close } from '@mui/icons-material';
import { Dispatch, SetStateAction } from 'react';

interface NotificationToastProps {
  notifications: { id: string; message: string }[];
  setNotifications: Dispatch<SetStateAction<{ id: string; message: string }[]>>;
}

export const NotificationToast = ({ notifications, setNotifications }: NotificationToastProps) => {
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
                <IconButton
                  size="small"
                  onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
                >
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
