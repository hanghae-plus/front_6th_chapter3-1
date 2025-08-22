import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { IconButton, MenuItem, Select, Stack } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

type CalendarNavigationProps = {
  view: 'week' | 'month';
  onNavigate: (direction: 'prev' | 'next') => void;
  onViewChange: (view: 'week' | 'month') => void;
};

export function CalendarNavigation({ view, onNavigate, onViewChange }: CalendarNavigationProps) {
  const handlePrevClick = () => {
    onNavigate('prev');
  };

  const handleNextClick = () => {
    onNavigate('next');
  };

  const handleViewChange = (e: SelectChangeEvent<'week' | 'month'>) => {
    onViewChange(e.target.value);
  };

  return (
    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
      <IconButton aria-label="Previous" onClick={handlePrevClick}>
        <ChevronLeft />
      </IconButton>
      <Select size="small" aria-label="뷰 타입 선택" value={view} onChange={handleViewChange}>
        <MenuItem value="week" aria-label="week-option">
          Week
        </MenuItem>
        <MenuItem value="month" aria-label="month-option">
          Month
        </MenuItem>
      </Select>
      <IconButton aria-label="Next" onClick={handleNextClick}>
        <ChevronRight />
      </IconButton>
    </Stack>
  );
}
