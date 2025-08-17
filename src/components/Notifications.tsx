import { Close } from '@mui/icons-material';
import { Stack, Alert, IconButton, AlertTitle } from '@mui/material';
import React from 'react';

export const Notifications = ({
  notifications,
  setNotifications,
}: {
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
}) => {
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
