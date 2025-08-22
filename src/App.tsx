import { Close } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import { CalendarView } from './components/CalendarView';
import { EventForm } from './components/EventForm';
import { EventList } from './components/EventList';
import { useEventManager } from './hooks/useEventManager';

function App() {
  const {
    formState,
    addOrUpdateEvent,
    calendarView,
    eventList,
    dialogs,
    notifications,
    saveEvent,
  } = useEventManager();

  const { formState: { editingEvent, title, date, startTime, endTime, description, location, category, isRepeating, repeatType, repeatInterval, repeatEndDate, notificationTime } } = { formState };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <EventForm formState={formState} onSubmit={addOrUpdateEvent} />
        <CalendarView
          view={calendarView.view}
          setView={calendarView.setView}
          currentDate={calendarView.currentDate}
          navigate={calendarView.navigate}
          filteredEvents={eventList.filteredEvents}
          notifiedEvents={eventList.notifiedEvents}
          holidays={calendarView.holidays}
        />
        <EventList
          searchTerm={eventList.searchTerm}
          setSearchTerm={eventList.setSearchTerm}
          filteredEvents={eventList.filteredEvents}
          notifiedEvents={eventList.notifiedEvents}
          onEdit={eventList.onEdit}
          onDelete={eventList.onDelete}
        />
      </Stack>

      <Dialog
        open={dialogs.isOverlapDialogOpen}
        onClose={() => dialogs.setIsOverlapDialogOpen(false)}
      >
        <DialogTitle>일정 겹침 경고</DialogTitle>
        <DialogContent>
          <DialogContentText>
            다음 일정과 겹칩니다:
            {dialogs.overlappingEvents.map((event) => (
              <Typography key={event.id} component="div">
                {event.title} ({event.date} {event.startTime}-{event.endTime})
              </Typography>
            ))}
            계속 진행하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => dialogs.setIsOverlapDialogOpen(false)}>취소</Button>
          <Button
            color="error"
            onClick={() => {
              dialogs.setIsOverlapDialogOpen(false);
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

      {notifications.notifications.length > 0 && (
        <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
          {notifications.notifications.map((notification, index) => (
            <Alert
              key={index}
              severity="info"
              sx={{ width: 'auto' }}
              action={
                <IconButton
                  size="small"
                  onClick={() =>
                    notifications.setNotifications((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <Close />
                </IconButton>
              }
            >
              <AlertTitle>{notification.message}</AlertTitle>
            </Alert>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default App;
