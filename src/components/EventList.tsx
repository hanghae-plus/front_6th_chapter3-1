import { Delete, Edit, Notifications } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { NOTIFICATION_OPTIONS } from '../constant/calendar';
import { Event } from '../types';

interface EventListProps {
  filteredEvents: Event[];
  notifiedEvents: string[];
  editEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
}

export const EventList = ({
  filteredEvents,
  notifiedEvents,
  editEvent,
  deleteEvent,
}: EventListProps) => {
  return (
    <>
      {filteredEvents.length === 0 ? (
        <Typography>검색 결과가 없습니다.</Typography>
      ) : (
        filteredEvents.map((event) => (
          <Box key={event.id} sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}>
            <Stack direction="row" justifyContent="space-between">
              <Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  {notifiedEvents.includes(event.id) && <Notifications color="error" />}
                  <Typography
                    fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                    color={notifiedEvents.includes(event.id) ? 'error' : 'inherit'}
                  >
                    {event.title}
                  </Typography>
                </Stack>
                <Typography>{event.date}</Typography>
                <Typography>
                  {event.startTime} - {event.endTime}
                </Typography>
                <Typography>{event.description}</Typography>
                <Typography>{event.location}</Typography>
                <Typography>카테고리: {event.category}</Typography>
                {event.repeat.type !== 'none' && (
                  <Typography>
                    반복: {event.repeat.interval}
                    {event.repeat.type === 'daily' && '일'}
                    {event.repeat.type === 'weekly' && '주'}
                    {event.repeat.type === 'monthly' && '월'}
                    {event.repeat.type === 'yearly' && '년'}
                    마다
                    {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
                  </Typography>
                )}
                <Typography>
                  알림:{' '}
                  {
                    NOTIFICATION_OPTIONS.find((option) => option.value === event.notificationTime)
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
    </>
  );
};
