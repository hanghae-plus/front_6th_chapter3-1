import { Stack, Typography } from '@mui/material';

import { Event } from '../types';
import { EventCard } from './EventCard';
import { SearchBar } from './SearchBar';

interface EventListProps {
  filteredEvents: Event[];
  notifiedEvents: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const EventList = ({
  filteredEvents,
  notifiedEvents,
  searchTerm,
  onSearchChange,
  onEditEvent,
  onDeleteEvent,
}: EventListProps) => {
  return (
    <Stack
      data-testid="event-list"
      spacing={2}
      sx={{ width: '30%', height: '100%', overflowY: 'auto' }}
    >
      <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />

      {filteredEvents.length === 0 ? (
        <Typography>검색 결과가 없습니다.</Typography>
      ) : (
        filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isNotified={notifiedEvents.includes(event.id)}
            onEdit={onEditEvent}
            onDelete={onDeleteEvent}
          />
        ))
      )}
    </Stack>
  );
};
