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
  onClose: () => void;
  overlappingEvents: Event[];
  onConfirm: () => void;
}

export const OverlapDialog = ({
  open,
  onClose,
  overlappingEvents,
  onConfirm,
}: OverlapDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <Typography component="p">다음 일정과 겹칩니다:</Typography>
          {overlappingEvents.map((event) => (
            <Typography key={event.id} component="div">
              {event.title} ({event.date} {event.startTime}-{event.endTime})
            </Typography>
          ))}
          <Typography component="p">계속 진행하시겠습니까?</Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button color="error" onClick={onConfirm}>
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
};
