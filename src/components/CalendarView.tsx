import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { IconButton, MenuItem, Select, Stack, Typography } from '@mui/material';
import React from 'react';

import { Event } from '../types';
import MonthView from './MonthView';
import WeekView from './WeekView';

interface CalendarViewProps {
  events: Event[];
  notifiedEvents: string[];
  currentDate: Date;
  holidays: { [key: string]: string };
  view: 'week' | 'month';
  setView: React.Dispatch<React.SetStateAction<'week' | 'month'>>;
  navigate: (direction: 'prev' | 'next') => void;
}

// events = filteredEvents
const CalendarView = ({
  events,
  notifiedEvents,
  currentDate,
  holidays,
  view,
  setView,
  navigate,
}: CalendarViewProps) => {
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

      {view === 'week' && (
        <WeekView events={events} notifiedEvents={notifiedEvents} currentDate={currentDate} />
      )}
      {view === 'month' && (
        <MonthView
          events={events}
          notifiedEvents={notifiedEvents}
          currentDate={currentDate}
          holidays={holidays}
        />
      )}
    </Stack>
  );
};

export default CalendarView;
