import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Typography,
  DialogActions,
  Button,
} from '@mui/material';
import { overlay } from 'overlay-kit';

import { Event } from '../types';

type Props = {
  isOpen: boolean;
  events: Event[];
  onClose: () => void;
  onSubmit: () => void;
};

const OverlappingDialog = ({ isOpen, events, onSubmit, onClose }: Props) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          다음 일정과 겹칩니다:
          {events.map((event) => (
            <Typography key={event.id} component="div">
              {event.title} ({event.date} {event.startTime}-{event.endTime})
            </Typography>
          ))}
          계속 진행하시겠습니까?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button color="error" onClick={onSubmit}>
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const openOverlappingDialog = (options: Pick<Props, 'onSubmit' | 'events'>) => {
  overlay.open(({ isOpen, close }) => (
    <OverlappingDialog
      isOpen={isOpen}
      events={options.events}
      onSubmit={() => {
        close();
        options.onSubmit();
      }}
      onClose={() => {
        if (isOpen) {
          close();
        }
      }}
    />
  ));
};
