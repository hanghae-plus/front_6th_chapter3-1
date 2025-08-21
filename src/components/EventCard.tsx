import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import Notifications from '@mui/icons-material/Notifications';
import { Box, IconButton, Stack, Typography } from '@mui/material';

import { Event } from '../types';
import { formatRepeatInfo, getNotificationLabel } from '../utils/eventUtils';

export interface EventCardProps {
  event: Event;
  isNotified: boolean;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

export const EventCard = ({ event, isNotified, onEdit, onDelete }: EventCardProps) => {
  const repeatText = formatRepeatInfo(event.repeat);

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
          {repeatText && <Typography>{repeatText}</Typography>}
          <Typography>알림: {getNotificationLabel(event.notificationTime)}</Typography>
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
};
