import { Box, Stack } from '@mui/material';

import { CalendarSection } from './components/CalendarSection.tsx';
import { EventEditor } from './components/EventEditor.tsx';
import { EventList } from './components/EventList.tsx';
import { OverlapDialog } from './components/OverlapDialog.tsx';
import { Noti } from './elements/Noti.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useEventSave } from './hooks/useEventSave.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useOverlapDialog } from './hooks/useOverlapDialog.ts';
import { useSearch } from './hooks/useSearch.ts';

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

  // 이벤트 저장
  const { handleSaveEvent, handleConfirmSave } = useEventSave({
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
  });

  /** 중복 이벤트 발생시 alert */
  const handleOverlapConfirm = () => {
    closeOverlapDialog();
    handleConfirmSave();
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        {/* 일정 입력 폼 */}
        <EventEditor {...eventEditorProps} onSubmit={handleSaveEvent} />

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
