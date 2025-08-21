import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Typography,
  DialogActions,
  Button,
} from '@mui/material';

const OverlapDialog = ({
  isOverlapDialogOpen,
  setIsOverlapDialogOpen,
  overlappingEvents,
  saveEvent,
  eventData,
}) => {
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
          }}
        >
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OverlapDialog;
