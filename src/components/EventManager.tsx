import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { IconButton, MenuItem, Select, Stack, Typography } from '@mui/material';
import React from 'react';

interface EventManagerProps {
  view: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void; // eslint-disable-line no-unused-vars
  onNavigate: (direction: 'prev' | 'next') => void; // eslint-disable-line no-unused-vars
  renderWeekView: () => React.ReactNode;
  renderMonthView: () => React.ReactNode;
}

export const EventManager: React.FC<EventManagerProps> = ({
  view,
  onViewChange,
  onNavigate,
  renderWeekView,
  renderMonthView,
}) => {
  return (
    <Stack flex={1} spacing={5}>
      <Typography variant="h4">일정 보기</Typography>

      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <IconButton aria-label="Previous" onClick={() => onNavigate('prev')}>
          <ChevronLeft />
        </IconButton>
        <Select
          size="small"
          aria-label="뷰 타입 선택"
          value={view}
          onChange={(e) => onViewChange(e.target.value as 'week' | 'month')}
        >
          <MenuItem value="week" aria-label="week-option">
            Week
          </MenuItem>
          <MenuItem value="month" aria-label="month-option">
            Month
          </MenuItem>
        </Select>
        <IconButton aria-label="Next" onClick={() => onNavigate('next')}>
          <ChevronRight />
        </IconButton>
      </Stack>

      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}
    </Stack>
  );
};
