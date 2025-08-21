import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { IconButton, MenuItem, Select, Stack, Typography } from '@mui/material';

import { CalendarMonthView } from './CalendarMonthView';
import { CalendarWeekView } from './CalendarWeekView';
import { useCalendarView } from '../hooks/useCalendarView';
import { useSearch } from '../hooks/useSearch';
import { Event } from '../types';

interface CalendarViewProps {
  events: Event[];
  notifiedEvents: string[];
}

export function CalendarViewComponent({ events, notifiedEvents }: CalendarViewProps) {
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { filteredEvents } = useSearch(events, currentDate, view);

  return (
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

      {view === 'month' ? (
        <CalendarMonthView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          holidays={holidays}
        />
      ) : (
        <CalendarWeekView
          currentDate={currentDate}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
        />
      )}
    </Stack>
  );
}
