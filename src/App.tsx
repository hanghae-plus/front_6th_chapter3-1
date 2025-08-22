import { Box, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import CalendarView from './components/CalendarView';
import EventForm from './components/EventForm';
import EventList from './components/EventList';
import NotificationStack from './components/NotificationStack';
import OverlapDialog from './components/OverlapDialog';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm as EventFormType } from './types';
import { findOverlappingEvents } from './utils/eventOverlap';

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

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventFormType = {
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
    };

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
          formData={{
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
          }}
          errors={{
            startTimeError: startTimeError || '',
            endTimeError: endTimeError || '',
          }}
          editingEvent={editingEvent}
          onInputChange={(field, value) => {
            switch (field) {
              case 'title':
                setTitle(value as string);
                break;
              case 'date':
                setDate(value as string);
                break;
              case 'startTime':
                handleStartTimeChange(value as string);
                break;
              case 'endTime':
                handleEndTimeChange(value as string);
                break;
              case 'description':
                setDescription(value as string);
                break;
              case 'location':
                setLocation(value as string);
                break;
              case 'category':
                setCategory(value as string);
                break;
              case 'isRepeating':
                setIsRepeating(value as boolean);
                break;
              case 'notificationTime':
                setNotificationTime(value as number);
                break;
            }
          }}
          onSubmit={addOrUpdateEvent}
        />
        <CalendarView
          view={view}
          currentDate={currentDate}
          holidays={holidays}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          onViewChange={setView}
          onNavigate={navigate}
        />

        <EventList
          events={filteredEvents}
          searchTerm={searchTerm}
          notifiedEvents={notifiedEvents}
          onSearchChange={setSearchTerm}
          onEdit={editEvent}
          onDelete={deleteEvent}
        />
      </Stack>

      <OverlapDialog
        open={isOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        onClose={() => setIsOverlapDialogOpen(false)}
        onContinue={() => {
          setIsOverlapDialogOpen(false);
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
      />

      <NotificationStack
        notifications={notifications}
        onRemoveNotification={(index) =>
          setNotifications((prev) => prev.filter((_, i) => i !== index))
        }
      />
    </Box>
  );
}

export default App;
