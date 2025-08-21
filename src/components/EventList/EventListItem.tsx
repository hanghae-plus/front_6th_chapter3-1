import { Notifications } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';

import { EventActions } from './EventActions';
import { Event } from '../../types';

interface EventListItemProps {
  event: Event;
  isNotified: boolean;
  notificationOptions: Array<{ value: number; label: string }>;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export const EventListItem = ({
  event,
  isNotified,
  notificationOptions,
  onEdit,
  onDelete,
}: EventListItemProps) => {
  return (
    <Box sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}>
      <Stack direction="row" justifyContent="space-between">
        <Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {isNotified && <Notifications color="error" />}
            <Typography
              fontWeight={isNotified ? 'bold' : 'normal'}
              color={isNotified ? 'error' : 'inherit'}
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
            {notificationOptions.find((option) => option.value === event.notificationTime)?.label}
          </Typography>
        </Stack>

        <EventActions event={event} onEdit={onEdit} onDelete={onDelete} />
      </Stack>
    </Box>
  );
};
