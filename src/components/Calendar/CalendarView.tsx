import { Stack } from '@mui/material';
import { Event } from '../../types';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';

interface CalendarViewProps {
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
  weekDays: string[];
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const CalendarView = ({
  view,
  setView,
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
  weekDays,
  onNavigate,
}: CalendarViewProps) => {
  return (
    <Stack flex={1} spacing={5}>
      <CalendarHeader view={view} setView={setView} onNavigate={onNavigate} />

      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          weekDays={weekDays}
        />
      )}

      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
          weekDays={weekDays}
        />
      )}
    </Stack>
  );
};
