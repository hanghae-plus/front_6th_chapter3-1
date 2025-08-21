import { Box, Stack } from '@mui/material';

import { CalendarViewComponent } from './components/CalendarView';
import { EventFormComponent } from './components/EventForm';
import { EventListComponent } from './components/EventList';
import { Notifications } from './components/Notifications';
import { useEventForm } from './hooks/useEventForm';
import { useEventOperations } from './hooks/useEventOperations';
import { useNotifications } from './hooks/useNotifications';

function App() {
  const eventForm = useEventForm();
  const { events, saveEvent, deleteEvent } = useEventOperations(
    Boolean(eventForm.editingEvent),
    () => eventForm.setEditingEvent(null)
  );
  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        {/* 일정 추가 */}
        <EventFormComponent events={events} eventForm={eventForm} saveEvent={saveEvent} />

        {/* 달력 뷰 */}
        <CalendarViewComponent events={events} notifiedEvents={notifiedEvents} />

        {/* 일정 목록 */}
        <EventListComponent
          events={events}
          notifiedEvents={notifiedEvents}
          editEvent={eventForm.editEvent}
          deleteEvent={deleteEvent}
        />
      </Stack>

      <Notifications
        notifications={notifications}
        onRemoveNotification={(index) =>
          setNotifications((prev) => prev.filter((_, i) => i !== index))
        }
      />
    </Box>
  );
}

export default App;
