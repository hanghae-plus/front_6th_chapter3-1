import { Notifications, Edit, Delete } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';

import { Event } from '../types';

interface EventCardProps {
  event: Event;
  notified: boolean;
  notificationLabel: string | undefined;
  onEdit: (_event: Event) => void;
  onDelete: (_id: string) => void;
}

export function EventCard({
  event,
  notified,
  notificationLabel,
  onEdit,
  onDelete,
}: EventCardProps) {
  return (
    <Box sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}>
      <Stack direction="row" justifyContent="space-between">
        <Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {notified && <Notifications color="error" />}
            <Typography
              fontWeight={notified ? 'bold' : 'normal'}
              color={notified ? 'error' : 'inherit'}
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
          <Typography>알림: {notificationLabel}</Typography>
        </Stack>
        <Stack>
          <IconButton aria-label="Edit event" onClick={() => onEdit(event)}>
            <Edit />
          </IconButton>
          <IconButton aria-label="Delete event" onClick={() => onDelete(event.id)}>
            <Delete />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}

export default EventCard;
