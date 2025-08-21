import { Box, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event } from './types';

import { findOverlappingEvents } from './utils/eventOverlap';
import { getTimeErrorMessage } from './utils/timeValidation';
import { validateEventForm } from './utils/eventValidation';
import { createEventData } from './utils/eventFormUtils';
import { weekDays } from './constants/weekDays';
import { notificationOptions } from './constants/notificationOptions';
import { EventForm } from './components/EventForm/EventForm';
import { CalendarView } from './components/Calendar/CalendarView';
import { EventList } from './components/EventList/EventList';
import NotificationContainer from './components/Notification/NotificationContainer.tsx';
import OverlapDialog from './components/Dialog/OverlapDialog.tsx';

function App() {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    // setRepeatType,
    repeatInterval,
    // setRepeatInterval,
    repeatEndDate,
    // setRepeatEndDate,
    notificationTime,
    setNotificationTime,
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

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  const addOrUpdateEvent = async () => {
    const validation = validateEventForm(
      title,
      date,
      startTime,
      endTime,
      startTimeError,
      endTimeError
    );

    if (!validation.isValid) {
      enqueueSnackbar(validation.message!, { variant: 'error' });
      return;
    }

    const eventData = createEventData({
      editingEvent,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      isRepeating,
      repeatType,
      repeatInterval,
      repeatEndDate,
      notificationTime,
    });

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
        <EventForm
          title={title}
          setTitle={setTitle}
          date={date}
          setDate={setDate}
          startTime={startTime}
          endTime={endTime}
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
          category={category}
          setCategory={setCategory}
          isRepeating={isRepeating}
          setIsRepeating={setIsRepeating}
          notificationTime={notificationTime}
          setNotificationTime={setNotificationTime}
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          editingEvent={editingEvent}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          onTimeBlur={() => getTimeErrorMessage(startTime, endTime)}
          onSubmit={addOrUpdateEvent}
        />

        <CalendarView
          view={view}
          setView={setView}
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
          weekDays={weekDays}
          onNavigate={navigate}
        />

        <EventList
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          notificationOptions={notificationOptions}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEditEvent={editEvent}
          onDeleteEvent={deleteEvent}
        />
      </Stack>

      <OverlapDialog
        open={isOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        onClose={() => setIsOverlapDialogOpen(false)}
        onConfirm={() => {
          setIsOverlapDialogOpen(false);
          const eventData = createEventData({
            editingEvent,
            title,
            date,
            startTime,
            endTime,
            description,
            location,
            category,
            isRepeating,
            repeatType,
            repeatInterval,
            repeatEndDate,
            notificationTime,
          });
          saveEvent(eventData);
        }}
      />

      <NotificationContainer
        notifications={notifications}
        onRemoveNotification={(index) =>
          setNotifications((prev) => prev.filter((_, i) => i !== index))
        }
      />
    </Box>
  );
}

export default App;
