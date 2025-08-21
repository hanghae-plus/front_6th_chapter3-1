import { Stack } from '@mui/material';

import CustomAlert from './CustomAlert';

const NotificationList = ({ notifications, setNotifications }) => {
  return (
    <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
      {notifications.map((notification, index) => (
        <CustomAlert
          key={index}
          index={index}
          notification={notification}
          setNotifications={setNotifications}
        />
      ))}
    </Stack>
  );
};

export default NotificationList;
