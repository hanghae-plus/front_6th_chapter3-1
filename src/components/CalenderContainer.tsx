import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import {
  IconButton,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  TextField,
} from '@mui/material';

import EventItem from './EventItem';
import MonthView from './MonthView';
import WeekView from './WeekView';
import { useCalendarView } from '../hooks/useCalendarView';
import { useSearch } from '../hooks/useSearch';
import { Event } from '../types';

interface CalenderContainerProps {
  events: Event[];
  notifiedEvents: string[];
  notificationOptions: { value: number; label: string }[];
  editEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
}

export default function CalenderContainer({
  events,
  notifiedEvents,
  notificationOptions,
  editEvent,
  deleteEvent,
}: CalenderContainerProps) {
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  return (
    <>
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
      {/* 일정 목록&검색 섹션 */}
      <Stack
        data-testid="event-list"
        spacing={2}
        sx={{ width: '30%', height: '100%', overflowY: 'auto' }}
      >
        <FormControl fullWidth>
          <FormLabel htmlFor="search">일정 검색</FormLabel>
          <TextField
            id="search"
            size="small"
            placeholder="검색어를 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormControl>

        {filteredEvents.length === 0 ? (
          <Typography>검색 결과가 없습니다.</Typography>
        ) : (
          filteredEvents.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              notifiedEvents={notifiedEvents}
              notificationOptions={notificationOptions}
              editEvent={editEvent}
              deleteEvent={deleteEvent}
            />
          ))
        )}
      </Stack>
    </>
  );
}
