import { Box, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';

import { CalendarSection } from './components/CalendarSection.tsx';
import { EventEditor } from './components/EventEditor.tsx';
import { EventList } from './components/EventList.tsx';
import { OverlapDialog } from './components/OverlapDialog.tsx';
import { Noti } from './elements/Noti.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useOverlapDialog } from './hooks/useOverlapDialog.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm } from './types';
import { findOverlappingEvents } from './utils/eventOverlap';

function App() {
  const {
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
    setEditingEvent,
    resetForm,
    editEvent,

    // eventEditor props
    eventEditorProps,
  } = useEventForm();

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifiedEvents } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);
  const { isOverlapDialogOpen, overlappingEvents, openOverlapDialog, closeOverlapDialog } =
    useOverlapDialog();

  const { enqueueSnackbar } = useSnackbar();

  /** 일정 추가 또는 수정 */
  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventForm = {
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
      openOverlapDialog(overlapping);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  /** 중복 이벤트 발생시 alert */
  const handleOverlapConfirm = () => {
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
    resetForm();
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        {/* 일정 입력 폼 */}
        <EventEditor {...eventEditorProps} onSubmit={addOrUpdateEvent} />

        {/* 캘린더 뷰 선택 */}
        <CalendarSection
          view={view}
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
          onViewChange={setView}
          onNavigate={navigate}
        />

        {/* 이벤트 목록 */}
        <EventList
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEditEvent={editEvent}
          onDeleteEvent={deleteEvent}
        />
      </Stack>

      {/* 중복 이벤트 alert */}
      <OverlapDialog
        isOpen={isOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        onClose={closeOverlapDialog}
        onConfirm={handleOverlapConfirm}
      />
      {/* 알림 */}
      <Noti events={events} />
    </Box>
  );
}

export default App;
