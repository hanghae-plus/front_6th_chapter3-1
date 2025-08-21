import { Box, Stack } from '@mui/material';

import { EventFormComponent } from './components/EventForm';
import { CalendarViewComponent } from './components/CalendarView';
import { EventListComponent } from './components/EventList';
import { Notification } from './components/Notification';
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
        <EventFormComponent events={events} eventForm={eventForm} saveEvent={saveEvent} />
        <CalendarViewComponent events={events} notifiedEvents={notifiedEvents} />
        <EventListComponent
          events={events}
          notifiedEvents={notifiedEvents}
          editEvent={eventForm.editEvent}
          deleteEvent={deleteEvent}
        />
      </Stack>

      <Notification
        notifications={notifications}
        onRemoveNotification={(index) =>
          setNotifications((prev) => prev.filter((_, i) => i !== index))
        }
      />
    </Box>
  );
}

export default App;
