import { Stack, Typography } from '@mui/material';
import { Event } from '../../types';
import { EventListItem } from './EventListItem';
import { EventSearch } from './EventSearch';

interface EventListProps {
  filteredEvents: Event[];
  notifiedEvents: string[];
  notificationOptions: Array<{ value: number; label: string }>;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
}

export const EventList = ({
  filteredEvents,
  notifiedEvents,
  notificationOptions,
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
      <EventSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />

      {filteredEvents.length === 0 ? (
        <Typography>검색 결과가 없습니다.</Typography>
      ) : (
        filteredEvents.map((event) => (
          <EventListItem
            key={event.id}
            event={event}
            isNotified={notifiedEvents.includes(event.id)}
            notificationOptions={notificationOptions}
            onEdit={onEditEvent}
            onDelete={onDeleteEvent}
          />
        ))
      )}
    </Stack>
  );
};
