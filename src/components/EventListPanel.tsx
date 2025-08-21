import { FormControl, FormLabel, Stack, TextField, Typography } from '@mui/material';

import { Event } from '../types';
import EventCard from './EventCard';

interface EventListPanelProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  events: Event[];
  notifiedEvents: string[];
  notificationLabelFor: (_minutes: number) => string | undefined;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export default function EventListPanel(props: EventListPanelProps) {
  const {
    searchTerm,
    setSearchTerm,
    events,
    notifiedEvents,
    notificationLabelFor,
    onEdit,
    onDelete,
  } = props;
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
      {events.length === 0 ? (
        <Typography>검색 결과가 없습니다.</Typography>
      ) : (
        events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            notified={notifiedEvents.includes(event.id)}
            notificationLabel={notificationLabelFor(event.notificationTime)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </Stack>
  );
}
