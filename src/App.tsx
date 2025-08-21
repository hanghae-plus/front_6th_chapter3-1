import { Box, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { CalendarView, Form, EventList, NotificationStack, OverlapDialog } from './components';
import { useCalendarView } from './hooks/useCalendarView';
import { useEventForm } from './hooks/useEventForm';
import { useEventOperations } from './hooks/useEventOperations';
import { useNotifications } from './hooks/useNotifications';
import { useSearch } from './hooks/useSearch';
import { Event, EventForm as EventFormType } from './types';
import { findOverlappingEvents } from './utils/eventOverlap';

function App() {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [pendingEventData, setPendingEventData] = useState<Event | EventFormType | null>(null);

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);
  const { editEvent } = useEventForm(editingEvent, setEditingEvent);

  const { enqueueSnackbar } = useSnackbar();

  const handleSaveEvent = async (eventData: Event | EventFormType) => {
    if (!eventData.title || !eventData.date || !eventData.startTime || !eventData.endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setPendingEventData(eventData);
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
    }
  };

  const handleOverlapContinue = async () => {
    setIsOverlapDialogOpen(false);

    if (pendingEventData) {
      await saveEvent(pendingEventData);
      setPendingEventData(null);
    }
  };

  const handleRemoveNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <Form
          onSave={handleSaveEvent}
          editingEvent={editingEvent}
          onEditingEventChange={setEditingEvent}
        />

        <CalendarView
          view={view}
          currentDate={currentDate}
          events={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
          onViewChange={setView}
          onNavigate={navigate}
        />

        <EventList
          events={filteredEvents}
          notifiedEvents={notifiedEvents}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEditEvent={editEvent}
          onDeleteEvent={deleteEvent}
        />
      </Stack>

      <OverlapDialog
        open={isOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        onClose={() => {
          setIsOverlapDialogOpen(false);
          setPendingEventData(null);
        }}
        onContinue={handleOverlapContinue}
      />

      <NotificationStack
        notifications={notifications}
        onRemoveNotification={handleRemoveNotification}
      />
    </Box>
  );
}

export default App;
