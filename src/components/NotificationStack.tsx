import { Close } from '@mui/icons-material';
import { Alert, AlertTitle, IconButton, Stack } from '@mui/material';
import React from 'react';

interface Notification {
  message: string;
}

interface NotificationStackProps {
  notifications: Notification[];
  onCloseNotification: (index: number) => void; // eslint-disable-line no-unused-vars
}

export const NotificationStack: React.FC<NotificationStackProps> = ({
  notifications,
  onCloseNotification,
}) => {
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
            <IconButton
              size="small"
              onClick={() => onCloseNotification(index)}
              aria-label="알림 닫기"
            >
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
