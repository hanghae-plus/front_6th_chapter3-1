import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';

import { Event } from '../types';

interface OverlapDialogProps {
  open: boolean;
  overlappingEvents: Event[];
  onClose: () => void;
  onContinue: () => void;
}

export default function OverlapDialog({
  open,
  overlappingEvents,
  onClose,
  onContinue,
}: OverlapDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle data-testid="overlap-dialog-title">일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText data-testid="overlap-dialog-content">
          다음 일정과 겹칩니다:
          {overlappingEvents.map((event) => (
            <Typography key={event.id} data-testid={`overlap-event-${event.id}`}>
              {event.title} ({event.date} {event.startTime}-{event.endTime})
            </Typography>
          ))}
          계속 진행하시겠습니까?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button data-testid="overlap-dialog-cancel" onClick={onClose}>
          취소
        </Button>
        <Button data-testid="overlap-dialog-continue" color="error" onClick={onContinue}>
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
}
