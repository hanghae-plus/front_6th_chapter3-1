import { Box, Stack } from '@mui/material';

import {
  CalendarViewSection,
  EventFormSection,
  EventListSection,
  NotificationAlert,
} from './components';
import { useCalendarView, useNotifications, useSearch, useEvents } from './hooks';

const categories = ['업무', '개인', '가족', '기타'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

function App() {
  const events = useEvents();
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);
  const { notifications, setNotifications, notifiedEvents } = useNotifications(events);

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <EventFormSection categories={categories} notificationOptions={notificationOptions} />

        <CalendarViewSection
          view={view}
          setView={setView}
          currentDate={currentDate}
          holidays={holidays}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          navigate={navigate}
        />

        <EventListSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredEvents={filteredEvents}
          notificationOptions={notificationOptions}
          notifiedEvents={notifiedEvents}
        />
      </Stack>

      <NotificationAlert
        notifications={notifications}
        onCloseNotification={(id) => {
          setNotifications((prev) => prev.filter((_, index) => index !== id));
        }}
      />
    </Box>
  );
}

export default App;
