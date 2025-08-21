import Close from '@mui/icons-material/Close';
import { Alert, AlertTitle, IconButton, Stack } from '@mui/material';

import { useNotifications } from '../hooks/useNotifications';
import { Event } from '../types';

interface NotiProps {
  events: Event[];
}

const Noti = ({ events }: NotiProps) => {
  /**알림 목록 */
  const { notifications, setNotifications } = useNotifications(events);

  /**알림 닫기 */
  const handleClose = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

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
                <IconButton size="small" onClick={() => handleClose(index)}>
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

export default Noti;
