import { Delete, Edit, Notifications } from '@mui/icons-material';
import {
  Box,
  FormControl,
  FormLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useEventOperations, useEventForm } from '../hooks';
import { Event } from '../types';

type NotificationOption = { value: number; label: string };

type Props = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredEvents: Readonly<Event[]>;
  notificationOptions: NotificationOption[];
  notifiedEvents: string[];
};

export const EventListSection = ({
  searchTerm,
  setSearchTerm,
  filteredEvents,
  notificationOptions,
  notifiedEvents,
}: Props) => {
  const { editEvent } = useEventForm();
  const { deleteEvent } = useEventOperations(Boolean(editEvent));
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
          <Box
            key={event.id}
            sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}
            data-testid="filtered-event"
          >
            <Stack direction="row" justifyContent="space-between">
              <Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  {notifiedEvents.includes(event.id) && <Notifications color="error" />}
                  <Typography
                    fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                    color={notifiedEvents.includes(event.id) ? 'error' : 'inherit'}
                    data-testid="title"
                  >
                    {event.title}
                  </Typography>
                </Stack>
                <Typography data-testid="date">{event.date}</Typography>
                <Typography data-testid="event-date-duration">
                  {event.startTime} - {event.endTime}
                </Typography>
                <Typography data-testid="description">{event.description}</Typography>
                <Typography data-testid="location">{event.location}</Typography>
                <Typography data-testid="category">카테고리: {event.category}</Typography>
                {event.repeat.type !== 'none' && (
                  <Typography data-testid="repeat-type">
                    반복: {event.repeat.interval}
                    {event.repeat.type === 'daily' && '일'}
                    {event.repeat.type === 'weekly' && '주'}
                    {event.repeat.type === 'monthly' && '월'}
                    {event.repeat.type === 'yearly' && '년'}
                    마다
                    {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
                  </Typography>
                )}
                <Typography data-testid="notification">
                  알림:{' '}
                  {
                    notificationOptions.find((option) => option.value === event.notificationTime)
                      ?.label
                  }
                </Typography>
              </Stack>
              <Stack>
                <IconButton aria-label="Edit event" onClick={() => editEvent(event)}>
                  <Edit />
                </IconButton>
                <IconButton aria-label="Delete event" onClick={() => deleteEvent(event.id)}>
                  <Delete />
                </IconButton>
              </Stack>
            </Stack>
          </Box>
        ))
      )}
    </Stack>
  );
};
