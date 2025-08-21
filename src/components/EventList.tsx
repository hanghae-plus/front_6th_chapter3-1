import { FormControl, FormLabel, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { EventCard } from './EventCard';
import { Event } from '../types';

interface EventListProps {
  events: Event[];
  notifiedEvents: string[];
  editEvent: (event: Event) => void;
  deleteEvent: (id: string) => Promise<void>;
}

export function EventListComponent({
  events,
  notifiedEvents,
  editEvent,
  deleteEvent,
}: EventListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
