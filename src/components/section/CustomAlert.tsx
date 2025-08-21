import Close from '@mui/icons-material/Close';
import { Alert, IconButton, AlertTitle } from '@mui/material';

const CustomAlert = ({ index, notification, setNotifications }) => {
  return (
    <Alert
      data-testid="alert"
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
  );
};

export default CustomAlert;
