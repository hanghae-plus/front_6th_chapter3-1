import { Box, Stack } from '@mui/material';
import { useState } from 'react';

import Calendar from './components/calendar/Calendar.tsx';
import OverlapDialog from './components/dialog/OverlapDialog.tsx';
import EventEditForm from './components/event-form/EventEditForm.tsx';
import EventList from './components/event-list/EventList.tsx';
import NotificationList from './components/notification/NotificationList.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event } from './types';
import { findOverlappingEvents } from './utils/eventOverlap';

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

function App() {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const editEvent = (event: Event) => {
    setEditingEvent(event);
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <EventEditForm
          findOverlappingEvents={findOverlappingEvents}
          setIsOverlapDialogOpen={setIsOverlapDialogOpen}
          setOverlappingEvents={setOverlappingEvents}
          saveEvent={saveEvent}
          events={events}
          notificationOptions={notificationOptions}
          editingEvent={editingEvent}
        />

        <Calendar
          currentDate={currentDate}
          holidays={holidays}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          view={view}
          setView={setView}
          navigate={navigate}
        />
        <EventList
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          deleteEvent={deleteEvent}
          editEvent={editEvent}
          notificationOptions={notificationOptions}
        />
      </Stack>

      <OverlapDialog
        isOverlapDialogOpen={isOverlapDialogOpen}
        setIsOverlapDialogOpen={setIsOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        saveEvent={saveEvent}
        eventData={editingEvent ? editingEvent : null}
      />

      {notifications.length > 0 && (
        <NotificationList notifications={notifications} setNotifications={setNotifications} />
      )}
    </Box>
  );
}

export default App;
