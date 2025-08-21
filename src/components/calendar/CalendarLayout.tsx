import { Stack, Typography } from '@mui/material';
import { WeekView, MonthView, CalendarNavigation } from './index';
import { Event } from '../../types';

interface CalendarLayoutProps {
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  navigate: (direction: 'prev' | 'next') => void;
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
}

export const CalendarLayout = ({
  view,
  setView,
  navigate,
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
}: CalendarLayoutProps) => {
  return (
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
  );
};
