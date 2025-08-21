import { Box, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import CalendarView from './components/CalendarView.tsx';
import EventForm from './components/EventForm.tsx';
import EventList from './components/EventList.tsx';
import NotificationList from './components/NotificationList.tsx';
import OverlapDialog from './components/OverlapDialog.tsx';
import { useFormContext } from './context/FormContext.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event } from './types';

function App() {
  const { editingEvent, setEditingEvent } = useFormContext();
  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        {/* 일정 폼 */}
        <EventForm
          events={events}
          enqueueSnackbar={enqueueSnackbar}
          setOverlappingEvents={setOverlappingEvents}
          setIsOverlapDialogOpen={setIsOverlapDialogOpen}
          saveEvent={saveEvent}
        />

        {/* 월/주별 일정 보기 */}
        <CalendarView
          events={filteredEvents}
          notifiedEvents={notifiedEvents}
          currentDate={currentDate}
          holidays={holidays}
          view={view}
          setView={setView}
          navigate={navigate}
        />

        {/* 이벤트 리스트 */}
        <EventList
          events={filteredEvents}
          notifiedEvents={notifiedEvents}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          deleteEvent={deleteEvent}
        />
      </Stack>

      {/* 이벤트 경고 모달 */}
      <OverlapDialog
        overlappingEvents={overlappingEvents}
        isOverlapDialogOpen={isOverlapDialogOpen}
        setIsOverlapDialogOpen={setIsOverlapDialogOpen}
        saveEvent={saveEvent}
      />

      {/* 알림 리스트 */}
      <NotificationList notifications={notifications} setNotifications={setNotifications} />
    </Box>
  );
}

export default App;
