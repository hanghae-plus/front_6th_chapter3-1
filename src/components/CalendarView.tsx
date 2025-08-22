import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { IconButton, MenuItem, Select, Stack, Typography } from '@mui/material';
import React from 'react';

import { Event } from '../types';
import { MonthlyView } from './MonthlyView.tsx';
import { WeeklyView } from './WeeklyView.tsx';

interface CalendarViewProps {
  events: Event[];
  navigate: (direction: 'prev' | 'next') => void;
  view: 'week' | 'month';
  setView: React.Dispatch<React.SetStateAction<'week' | 'month'>>;
  currentDate: Date;
  holidays: { [key: string]: string };
  notifiedEvents: string[];
}

export const CalendarView = ({
  events,
  navigate,
  holidays,
  view,
  setView,
  currentDate,
  notifiedEvents,
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
        <WeeklyView currentDate={currentDate} events={events} notifiedEvents={notifiedEvents} />
      )}
      {view === 'month' && (
        <MonthlyView
          events={events}
          notifiedEvents={notifiedEvents}
          currentDate={currentDate}
          holidays={holidays}
        />
      )}
    </Stack>
  );
};
