import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

import { Event } from '../types';

interface OverlapDialogProps {
  open: boolean;
  onClose: () => void;
  overlappingEvents: Event[];
  onConfirm: () => void;
}

export function OverlapDialog({ open, onClose, overlappingEvents, onConfirm }: OverlapDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          다음 일정과 겹칩니다:
        </Typography>
        {overlappingEvents.map((event) => (
          <Typography key={event.id} variant="body2" sx={{ ml: 2, mb: 1 }}>
            {event.title} ({event.date} {event.startTime}-{event.endTime})
          </Typography>
        ))}
        <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
          계속 진행하시겠습니까?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          color="error"
          onClick={() => {
            onClose();
            onConfirm();
          }}
        >
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
}
