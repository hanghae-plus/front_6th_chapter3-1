import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { IconButton, MenuItem, Select, Stack } from '@mui/material';

type CalendarNavigationProps = {
  currentDate: Date;
  view: 'week' | 'month';
  onNavigate: (direction: 'prev' | 'next') => void;
  onViewChange: (view: 'week' | 'month') => void;
};

export function CalendarNavigation({
  currentDate,
  view,
  onNavigate,
  onViewChange,
}: CalendarNavigationProps) {
  return (
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
  );
}
