import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';

import { Event, EventForm } from '../types';

interface EventOverlapDialogProps {
  eventData: Event | EventForm;
  isOverlapDialogOpen: boolean;
  setIsOverlapDialogOpen: (isOpen: boolean) => void;
  overlappingEvents: Event[];
  saveEvent: (event: Event | EventForm) => Promise<void>;
  resetForm: () => void;
}

export const EventOverlapDialog = ({
  eventData,
  isOverlapDialogOpen,
  setIsOverlapDialogOpen,
  overlappingEvents,
  saveEvent,
  resetForm,
}: EventOverlapDialogProps) => {
  return (
    <Dialog open={isOverlapDialogOpen} onClose={() => setIsOverlapDialogOpen(false)}>
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
        <Button onClick={() => setIsOverlapDialogOpen(false)}>취소</Button>
        <Button
          color="error"
          onClick={() => {
            setIsOverlapDialogOpen(false);
            saveEvent(eventData);
            resetForm();
          }}
        >
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
};
