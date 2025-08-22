import { Stack, Typography } from '@mui/material';

import type { Event } from '../types';
import { CalendarNavigation } from './CalendarNavigation';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';

type CalendarContainerProps = {
  view: 'week' | 'month';
  currentDate: Date;
  holidays: Record<string, string>;
  events: Event[];
  notifiedEvents: string[];
  onNavigate: (direction: 'prev' | 'next') => void;
  onViewChange: (view: 'week' | 'month') => void;
};

export function CalendarContainer({
  view,
  currentDate,
  holidays,
  events,
  notifiedEvents,
  onNavigate,
  onViewChange,
}: CalendarContainerProps) {
  return (
    <Stack flex={1} spacing={5}>
      <Typography variant="h4">일정 보기</Typography>
      <CalendarNavigation view={view} onNavigate={onNavigate} onViewChange={onViewChange} />
      {view === 'week' ? (
        <WeekView
          currentDate={currentDate}
          events={events}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />
      ) : (
        <MonthView
          currentDate={currentDate}
          events={events}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />
      )}
    </Stack>
  );
}
