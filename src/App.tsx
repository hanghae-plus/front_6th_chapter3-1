import { Box, Stack } from '@mui/material';

import { CalendarView } from './components/CalendarView';
import { EventForm } from './components/EventForm';
import { EventList } from './components/EventList';
import { NotificationStack } from './components/NotificationStack';
import { OverlapDialog } from './components/OverlapDialog';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventHandlers } from './hooks/useEventHandlers.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useOverlapDialog } from './hooks/useOverlapDialog.ts';
import { useSearch } from './hooks/useSearch.ts';

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
    repeatInterval,
    repeatEndDate,
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
  const { isOverlapDialogOpen, overlappingEvents, openOverlapDialog, closeOverlapDialog } =
    useOverlapDialog();

  const { addOrUpdateEvent, handleOverlapDialogContinue } = useEventHandlers({
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
    startTimeError,
    endTimeError,
    editingEvent,
    events,
    saveEvent,
    resetForm,
    openOverlapDialog,
    closeOverlapDialog,
  });

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
          onSubmit={addOrUpdateEvent}
        />

        <CalendarView
          view={view}
          setView={setView}
          currentDate={currentDate}
          holidays={holidays}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          navigate={navigate}
        />

        <EventList
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          onEditEvent={editEvent}
          onDeleteEvent={deleteEvent}
        />
      </Stack>

      <OverlapDialog
        isOpen={isOverlapDialogOpen}
        onClose={closeOverlapDialog}
        overlappingEvents={overlappingEvents}
        onContinue={handleOverlapDialogContinue}
      />

      <NotificationStack
        notifications={notifications}
        onDismiss={(index: number) =>
          setNotifications((prev) => prev.filter((_, i) => i !== index))
        }
      />
    </Box>
  );
}

export default App;
