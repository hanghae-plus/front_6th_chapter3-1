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
  isOpen: boolean;
  onClose: () => void;
  overlappingEvents: Event[];
  onCancel: () => void;
  onOk: () => void;
}

export default function OverlapDialog({
  isOpen,
  onClose,
  overlappingEvents,
  onOk,
}: OverlapDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText>
          다음 일정과 겹칩니다:
          {overlappingEvents.map((event) => (
            <Typography key={event.id}>
              {event.title} ({event.date} {event.startTime}-{event.endTime})
            </Typography>
          ))}
          계속 진행하시겠습니까?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button color="error" onClick={onOk}>
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
}
