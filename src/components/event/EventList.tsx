import { Stack, TextField, Typography } from '@mui/material';

import { Event } from '../../types';

import { EventCard } from './EventCard';

interface EventListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredEvents: Event[];
  notifiedEvents: string[];
  editEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
}

export function EventList({
  searchTerm,
  setSearchTerm,
  filteredEvents,
  notifiedEvents,
  editEvent,
  deleteEvent,
}: EventListProps) {
  return (
    <Stack
      data-testid="event-list"
      spacing={2}
      sx={{ width: '30%', height: '100%', overflowY: 'auto' }}
    >
      <TextField
        id="search"
        size="small"
        placeholder="검색어를 입력하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        label="일정 검색"
        fullWidth
      />

      {filteredEvents.length === 0 ? (
        <Typography>검색 결과가 없습니다.</Typography>
      ) : (
        filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isNotified={notifiedEvents.includes(event.id)}
            onEdit={editEvent}
            onDelete={deleteEvent}
          />
        ))
      )}
    </Stack>
  );
}
