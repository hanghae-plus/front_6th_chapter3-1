import { Close } from '@mui/icons-material';
import { Alert, AlertTitle, IconButton, Stack } from '@mui/material';

interface NotificationListProps {
  notifications: {
    id: string;
    message: string;
  }[];
  setNotifications: (
    value: React.SetStateAction<
      {
        id: string;
        message: string;
      }[]
    >
  ) => void;
}

export const NotificationList = ({
    notifications,
    setNotifications,
                                 }: NotificationListProps) => {
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
