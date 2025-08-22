import { FormControl, FormLabel, Stack, TextField, Typography } from '@mui/material';

import EventCard from './EventCard';
import { Event } from '../types';

interface EventListProps {
  events: Event[];
  searchTerm: string;
  notifiedEvents: string[];
  onSearchChange: (searchTerm: string) => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

export default function EventList({
  events,
  searchTerm,
  notifiedEvents,
  onSearchChange,
  onEdit,
  onDelete,
}: EventListProps) {
  return (
    <Stack
      data-testid="event-list"
      spacing={2}
      sx={{ width: '30%', height: '100%', overflowY: 'auto' }}
    >
      <FormControl fullWidth>
        <FormLabel htmlFor="search">일정 검색</FormLabel>
        <TextField
          id="search"
          data-testid="search-input"
          size="small"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </FormControl>

      {events.length === 0 ? (
        <Typography data-testid="no-events-message">검색 결과가 없습니다.</Typography>
      ) : (
        events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isNotified={notifiedEvents.includes(event.id)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </Stack>
  );
}
