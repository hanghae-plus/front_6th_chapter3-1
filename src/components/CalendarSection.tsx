import { Stack, Typography } from '@mui/material';

import { Event } from '../types';
import { MonthView } from './MonthView';
import { ViewSelector } from './ViewSelector';
import { WeekView } from './WeekView';

interface CalendarSectionProps {
  view: 'week' | 'month';
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
  onViewChange: (view: 'week' | 'month') => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const CalendarSection = ({
  view,
  currentDate,
  filteredEvents,
  notifiedEvents,
  holidays,
  onViewChange,
  onNavigate,
}: CalendarSectionProps) => {
  return (
    <Stack flex={1} spacing={5}>
      <Typography variant="h4">일정 보기</Typography>
      <ViewSelector view={view} onViewChange={onViewChange} onNavigate={onNavigate} />

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
