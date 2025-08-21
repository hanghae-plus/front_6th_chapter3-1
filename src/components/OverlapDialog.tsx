import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import React from 'react';

import { useFormContext } from '../context/FormContext';
import { Event, EventForm } from '../types';

interface OverlapDialogProps {
  overlappingEvents: Event[];
  isOverlapDialogOpen: boolean;
  setIsOverlapDialogOpen: (value: React.SetStateAction<boolean>) => void;
  saveEvent: (eventData: Event | EventForm) => Promise<void>;
}

const OverlapDialog = ({
  overlappingEvents,
  isOverlapDialogOpen,
  setIsOverlapDialogOpen,
  saveEvent,
}: OverlapDialogProps) => {
  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    isRepeating,
    repeatType,
    // setRepeatType,
    repeatInterval,
    // setRepeatInterval,
    repeatEndDate,
    // setRepeatEndDate,
    notificationTime,
    editingEvent,
  } = useFormContext();

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
            saveEvent({
              id: editingEvent ? editingEvent.id : undefined,
              title,
              date,
              startTime,
              endTime,
              description,
              location,
              category,
              repeat: {
                type: isRepeating ? repeatType : 'none',
                interval: repeatInterval,
                endDate: repeatEndDate || undefined,
              },
              notificationTime,
            });
          }}
        >
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OverlapDialog;
