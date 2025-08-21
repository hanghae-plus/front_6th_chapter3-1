import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { IconButton, MenuItem, Select, Stack } from '@mui/material';

type ViewType = 'week' | 'month';

interface CalendarToolbarProps {
  view: ViewType;
  onChangeView: (view: ViewType) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function CalendarToolbar({ view, onChangeView, onPrev, onNext }: CalendarToolbarProps) {
  return (
    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
      <IconButton aria-label="Previous" onClick={onPrev}>
        <ChevronLeft />
      </IconButton>
      <Select
        size="small"
        aria-label="뷰 타입 선택"
        value={view}
        onChange={(e) => onChangeView(e.target.value as ViewType)}
      >
        <MenuItem value="week" aria-label="week-option">
          Week
        </MenuItem>
        <MenuItem value="month" aria-label="month-option">
          Month
        </MenuItem>
      </Select>
      <IconButton aria-label="Next" onClick={onNext}>
        <ChevronRight />
      </IconButton>
    </Stack>
  );
}

export default CalendarToolbar;
