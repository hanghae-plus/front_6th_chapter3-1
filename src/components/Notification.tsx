import { Close } from '@mui/icons-material';
import { Alert, AlertTitle, IconButton } from '@mui/material';

type NotificationProps = {
  message: string;
  onRemove: () => void;
};

export function Notification({ message, onRemove }: NotificationProps) {
  return (
    <Alert
      severity="info"
      sx={{ width: 'auto' }}
      action={
        <IconButton size="small" onClick={onRemove}>
          <Close />
        </IconButton>
      }
    >
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
}
