import { Close } from '@mui/icons-material';
import { Alert, AlertTitle, IconButton } from '@mui/material';

interface NotificationItemProps {
  message: string;
  onClose: () => void;
}

export default function NotificationItem({ message, onClose }: NotificationItemProps) {
  return (
    <Alert
      severity="info"
      sx={{ width: 'auto' }}
      action={
        <IconButton size="small" onClick={onClose}>
          <Close />
        </IconButton>
      }
    >
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
}
