import { Box, Button as _Button, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { CalendarNavigation } from './components/CalendarNavigation.tsx';
import { EventList } from './components/EventList.tsx';
import { EventSubmitForm } from './components/EventSubmitForm.tsx';
import { MonthView } from './components/MonthView.tsx';
import { NotificationList } from './components/NotificationList.tsx';
import { OverlapDialog } from './components/OverlapDialog.tsx';
import { WeekView } from './components/WeekView.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventFormData } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useEventTimeManager } from './hooks/useEventTimeManager.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
// import { Event, EventForm, RepeatType } from './types';
import { Event, EventForm } from './types';
import { findOverlappingEvents } from './utils/eventOverlap';

function App() {
  // 폼 데이터 관리
  const {
    formData,
    setFormData,
    editingEvent,
    setEditingEvent,
    getEventData,
    setEventData,
    resetFormData,
  } = useEventFormData();

  // 시간 검증
  const { startTimeError, endTimeError, createTimeChangeHandler, clearTimeErrors } =
    useEventTimeManager();

  // 시간 변경 핸들러
  const handleStartTimeChange = createTimeChangeHandler(
    'start',
    formData.endTime,
    (value: string) => setFormData((prev) => ({ ...prev, startTime: value }))
  );
  const handleEndTimeChange = createTimeChangeHandler('end', formData.startTime, (value: string) =>
    setFormData((prev) => ({ ...prev, endTime: value }))
  );

  // 폼 리셋 (데이터 + 에러)
  const resetForm = () => {
    resetFormData();
    clearTimeErrors();
  };

  // 이벤트 편집
  const editEvent = (event: Event) => {
    setEventData(event);
    setEditingEvent(event);
    clearTimeErrors();
  };

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
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      ...getEventData(),
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
        <EventSubmitForm
          title={formData.title}
          setTitle={(value: string) => setFormData((prev) => ({ ...prev, title: value }))}
          date={formData.date}
          setDate={(value: string) => setFormData((prev) => ({ ...prev, date: value }))}
          startTime={formData.startTime}
          endTime={formData.endTime}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          startTimeError={startTimeError || ''}
          endTimeError={endTimeError || ''}
          description={formData.description}
          setDescription={(value: string) =>
            setFormData((prev) => ({ ...prev, description: value }))
          }
          location={formData.location}
          setLocation={(value: string) => setFormData((prev) => ({ ...prev, location: value }))}
          category={formData.category}
          setCategory={(value: string) => setFormData((prev) => ({ ...prev, category: value }))}
          isRepeating={formData.isRepeating}
          setIsRepeating={(value: boolean) =>
            setFormData((prev) => ({ ...prev, isRepeating: value }))
          }
          notificationTime={formData.notificationTime}
          setNotificationTime={(value: number) =>
            setFormData((prev) => ({ ...prev, notificationTime: value }))
          }
          editingEvent={editingEvent}
          addOrUpdateEvent={addOrUpdateEvent}
        />

        <Stack flex={1} spacing={5}>
          <Typography variant="h4">일정 보기</Typography>

          <CalendarNavigation view={view} setView={setView} navigate={navigate} />

          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              notifiedEvents={notifiedEvents}
            />
          )}
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              filteredEvents={filteredEvents}
              notifiedEvents={notifiedEvents}
              holidays={holidays}
            />
          )}
        </Stack>

        <EventList
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          editEvent={editEvent}
          deleteEvent={deleteEvent}
        />
      </Stack>

      <OverlapDialog
        open={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        overlappingEvents={overlappingEvents}
        onConfirm={() => {
          setIsOverlapDialogOpen(false);
          saveEvent({
            id: editingEvent ? editingEvent.id : undefined,
            ...getEventData(),
          });
        }}
      />

      <NotificationList notifications={notifications} setNotifications={setNotifications} />
    </Box>
  );
}

export default App;
