import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import type { Event } from '../types';

type OverlapDialogProps = {
  isOpen: boolean;
  overlappingEvents: Event[];
  onConfirm: () => void;
  onCancel: () => void;
};

export function OverlapDialog({
  isOpen,
  overlappingEvents,
  onConfirm,
  onCancel,
}: OverlapDialogProps) {
  const handleCancel = () => {
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onClose={handleCancel}>
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText>
          다음 일정과 겹칩니다:
          {overlappingEvents.map(({ date, endTime, id, startTime, title }) => (
            <span key={id} style={{ display: 'block' }}>
              {title} ({date} {startTime}-{endTime})
            </span>
          ))}
          계속 진행하시겠습니까?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>취소</Button>
        <Button color="error" onClick={handleConfirm}>
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
}
