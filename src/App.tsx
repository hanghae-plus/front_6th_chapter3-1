import { Notifications, Delete, Edit } from '@mui/icons-material';
import {
  Box,
  FormControl,
  FormLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';

import { EventForm } from './components/EventForm';
import { EventManager } from './components/EventManager';
import { EventOverlapDialog } from './components/EventOverlapDialog';
import { NotificationStack } from './components/NotificationStack';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventDisplay } from './hooks/useEventDisplay.tsx';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useEventOverlap } from './hooks/useEventOverlap';
import { useEventValidation } from './hooks/useEventValidation';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
// import { Event, EventForm, RepeatType } from './types';
import { Event, EventForm as EventFormData } from './types';
import { weekDays } from './utils/constants';
import { formatRepeatInfo, getNotificationLabel } from './utils/eventUtils';

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

  // const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  // const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const { isOverlapDialogOpen, overlappingEvents, checkAndHandleOverlap, closeOverlapDialog } =
    useEventOverlap();
  const { validateEventForm } = useEventValidation();
  const { renderWeekView, renderMonthView } = useEventDisplay(
    currentDate,
    filteredEvents,
    notifiedEvents,
    holidays,
    weekDays
  );

  const addOrUpdateEvent = async () => {
    if (!validateEventForm({ title, date, startTime, endTime, startTimeError, endTimeError })) {
      return;
    }

    const eventData: Event | EventFormData = {
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

    await checkAndHandleOverlap(eventData, events, saveEvent, resetForm);
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <EventForm
          title={title}
          date={date}
          startTime={startTime}
          endTime={endTime}
          description={description}
          location={location}
          category={category}
          isRepeating={isRepeating}
          repeatType={repeatType}
          repeatInterval={repeatInterval}
          repeatEndDate={repeatEndDate}
          notificationTime={notificationTime}
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          editingEvent={editingEvent}
          onTitleChange={setTitle}
          onDateChange={setDate}
          onStartTimeChange={(value: string) => {
            handleStartTimeChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
          }}
          onEndTimeChange={(value: string) => {
            handleEndTimeChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
          }}
          onDescriptionChange={setDescription}
          onLocationChange={setLocation}
          onCategoryChange={setCategory}
          onIsRepeatingChange={setIsRepeating}
          onNotificationTimeChange={setNotificationTime}
          onSubmit={addOrUpdateEvent}
        />

        <EventManager
          view={view}
          onViewChange={setView}
          onNavigate={navigate}
          renderWeekView={renderWeekView}
          renderMonthView={renderMonthView}
        />

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

          {filteredEvents.length === 0 ? (
            <Typography>검색 결과가 없습니다.</Typography>
          ) : (
            filteredEvents.map((event) => (
              <Box key={event.id} sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {notifiedEvents.includes(event.id) && <Notifications color="error" />}
                      <Typography
                        fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                        color={notifiedEvents.includes(event.id) ? 'error' : 'inherit'}
                      >
                        {event.title}
                      </Typography>
                    </Stack>
                    <Typography>{event.date}</Typography>
                    <Typography>
                      {event.startTime} - {event.endTime}
                    </Typography>
                    <Typography>{event.description}</Typography>
                    <Typography>{event.location}</Typography>
                    <Typography>카테고리: {event.category}</Typography>
                    {event.repeat.type !== 'none' && (
                      <Typography>반복: {formatRepeatInfo(event.repeat)}</Typography>
                    )}
                    <Typography>알림: {getNotificationLabel(event.notificationTime)}</Typography>
                  </Stack>
                  <Stack>
                    <IconButton aria-label="Edit event" onClick={() => editEvent(event)}>
                      <Edit />
                    </IconButton>
                    <IconButton aria-label="Delete event" onClick={() => deleteEvent(event.id)}>
                      <Delete />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      </Stack>

      <EventOverlapDialog
        isOpen={isOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        onClose={closeOverlapDialog}
        onContinue={() => {
          closeOverlapDialog();
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
        onCloseNotification={(index) =>
          setNotifications((prev) => prev.filter((_, i) => i !== index))
        }
      />
    </Box>
  );
}

export default App;
