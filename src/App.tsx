import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, IconButton, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { CalendarView } from './components/CalendarView';
import { EventForm } from './components/EventForm';
import { EventList } from './components/EventList';
import { NotificationToast } from './components/NotificationToast';
import { OverlapDialog } from './components/OverlapDialog';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm as EventFormType } from './types';

function App() {
  const eventFormHook = useEventForm();
  const { setEditingEvent, editEvent } = eventFormHook;
  const { events, saveEvent, deleteEvent } = useEventOperations(
    !!eventFormHook.editingEvent,
    () => {
      setEditingEvent(null);
      eventFormHook.resetForm();
    }
  );
  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const handleSubmitEvent = async (eventData: Event | EventFormType) => {
    await saveEvent(eventData);
  };

  const handleOverlapDetected = (overlapping: Event[]) => {
    setOverlappingEvents(overlapping);
    setIsOverlapDialogOpen(true);
  };

  const handleConfirmOverlap = async () => {
    setIsOverlapDialogOpen(false);
    if (overlappingEvents.length > 0) {
      // 실제 폼 데이터 사용
      const eventData = {
        id: eventFormHook.editingEvent?.id,
        title: eventFormHook.title,
        date: eventFormHook.date,
        startTime: eventFormHook.startTime,
        endTime: eventFormHook.endTime,
        description: eventFormHook.description,
        location: eventFormHook.location,
        category: eventFormHook.category,
        repeat: {
          type: eventFormHook.isRepeating ? eventFormHook.repeatType : ('none' as const),
          interval: eventFormHook.repeatInterval,
          endDate: eventFormHook.repeatEndDate || undefined,
        },
        notificationTime: eventFormHook.notificationTime,
      };
      await saveEvent(eventData);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <EventForm
          events={events}
          onSubmit={handleSubmitEvent}
          onOverlapDetected={handleOverlapDetected}
          eventFormHook={eventFormHook}
        />

        <Stack flex={1} spacing={5}>
          <Typography variant="h4">일정 보기</Typography>

          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <IconButton aria-label="Previous" onClick={() => navigate('prev')}>
              <ChevronLeft />
            </IconButton>
            <Select
              size="small"
              aria-label="뷰 타입 선택"
              value={view}
              onChange={(e) => setView(e.target.value as 'week' | 'month')}
            >
              <MenuItem value="week" aria-label="week-option">
                Week
              </MenuItem>
              <MenuItem value="month" aria-label="month-option">
                Month
              </MenuItem>
            </Select>
            <IconButton aria-label="Next" onClick={() => navigate('next')}>
              <ChevronRight />
            </IconButton>
          </Stack>

          <CalendarView
            view={view}
            currentDate={currentDate}
            events={filteredEvents}
            holidays={holidays}
            notifiedEvents={notifiedEvents}
          />
        </Stack>

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
        onClose={() => setIsOverlapDialogOpen(false)}
        onConfirm={handleConfirmOverlap}
      />

      <NotificationToast
        notifications={notifications}
        onRemoveNotification={(index) =>
          setNotifications((prev) => prev.filter((_, i) => i !== index))
        }
      />
    </Box>
  );
}

export default App;
