import { Box, FormControl, FormLabel, Stack, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { CalendarNavigation } from './components/CalendarNavigation.tsx';
import { EventFormPanel } from './components/EventFormPanel.tsx';
import { EventList } from './components/EventList.tsx';
import { EventOverlapDialog } from './components/EventOverlapDialog.tsx';
import { MonthCalendar } from './components/MonthCalendar.tsx';
import { NotificationToast } from './components/NotificationToast.tsx';
import { WeekCalendar } from './components/WeekCalendar.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm } from './types';
import { findOverlappingEvents } from './utils/eventOverlap';

function App() {
  const {
    eventForm,
    setEventForm,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = useEventForm();

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, removeNotification } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const { enqueueSnackbar } = useSnackbar();
  const eventData: Event | EventForm = {
    id: editingEvent ? editingEvent.id : undefined,
    title: eventForm.title,
    date: eventForm.date,
    startTime: eventForm.startTime,
    endTime: eventForm.endTime,
    description: eventForm.description,
    location: eventForm.location,
    category: eventForm.category,
    repeat: {
      type: eventForm.isRepeating ? eventForm.repeatType : 'none',
      interval: eventForm.repeatInterval,
      endDate: eventForm.repeatEndDate || undefined,
    },
    notificationTime: eventForm.notificationTime,
  };

  const addOrUpdateEvent = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.startTime || !eventForm.endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <EventFormPanel
          editingEvent={editingEvent}
          eventForm={eventForm}
          setEventForm={setEventForm}
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          addOrUpdateEvent={addOrUpdateEvent}
        />
        <Stack flex={1} spacing={5}>
          <Typography variant="h4">일정 보기</Typography>
          <CalendarNavigation view={view} setView={setView} navigate={navigate} />
          {view === 'week' && (
            <WeekCalendar
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              notifiedEvents={notifiedEvents}
            />
          )}
          {view === 'month' && (
            <MonthCalendar
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              notifiedEvents={notifiedEvents}
              holidays={holidays}
            />
          )}
        </Stack>
        <Stack
          data-testid="event-list"
          spacing={2}
          sx={{ width: '30%', height: '100%', overflowY: 'auto' }}
        >
          <FormControl fullWidth>
            <FormLabel htmlFor="search">일정 검색</FormLabel>
            <TextField
              id="search"
              size="small"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormControl>

          <EventList
            filteredEvents={filteredEvents}
            notifiedEvents={notifiedEvents}
            editEvent={editEvent}
            deleteEvent={deleteEvent}
          />
        </Stack>
      </Stack>
      <EventOverlapDialog
        eventData={eventData}
        isOverlapDialogOpen={isOverlapDialogOpen}
        setIsOverlapDialogOpen={setIsOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        saveEvent={saveEvent}
        resetForm={resetForm}
      />
      <NotificationToast notifications={notifications} removeNotification={removeNotification} />
    </Box>
  );
}

export default App;
