import { Notifications, Delete, Edit } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';

import { notificationOptions } from '../constants';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  isNotified: boolean;
  onEdit: (_event: Event) => void;
  onDelete: (_eventId: string) => void;
}

export default function EventCard({ event, isNotified, onEdit, onDelete }: EventCardProps) {
  const getNotificationLabel = (notificationTime: number) => {
    const option = notificationOptions.find((opt) => opt.value === notificationTime);
    return option?.label || '알림 없음';
  };

  const getRepeatText = (repeat: Event['repeat']) => {
    if (repeat.type === 'none') return '';

    const intervalText = `${repeat.interval}`;
    const typeText =
      repeat.type === 'daily'
        ? '일'
        : repeat.type === 'weekly'
          ? '주'
          : repeat.type === 'monthly'
            ? '월'
            : repeat.type === 'yearly'
              ? '년'
              : '';

    const endDateText = repeat.endDate ? ` (종료: ${repeat.endDate})` : '';

    return `반복: ${intervalText}${typeText}마다${endDateText}`;
  };

  return (
    <Box
      data-testid={`event-card-${event.id}`}
      sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}
    >
      <Stack direction="row" justifyContent="space-between">
        <Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {isNotified && (
              <Notifications data-testid={`notification-icon-${event.id}`} color="error" />
            )}
            <Typography
              data-testid={`event-title-${event.id}`}
              fontWeight={isNotified ? 'bold' : 'normal'}
              color={isNotified ? 'error' : 'inherit'}
            >
              {event.title}
            </Typography>
          </Stack>

          <Typography data-testid={`event-date-${event.id}`}>{event.date}</Typography>

          <Typography data-testid={`event-time-${event.id}`}>
            {event.startTime} - {event.endTime}
          </Typography>

          <Typography data-testid={`event-description-${event.id}`}>{event.description}</Typography>

          <Typography data-testid={`event-location-${event.id}`}>{event.location}</Typography>

          <Typography data-testid={`event-category-${event.id}`}>
            카테고리: {event.category}
          </Typography>

          {event.repeat.type !== 'none' && (
            <Typography data-testid={`event-repeat-${event.id}`}>
              {getRepeatText(event.repeat)}
            </Typography>
          )}

          <Typography data-testid={`event-notification-${event.id}`}>
            알림: {getNotificationLabel(event.notificationTime)}
          </Typography>
        </Stack>

        <Stack>
          <IconButton
            data-testid={`edit-button-${event.id}`}
            aria-label="Edit event"
            onClick={() => onEdit(event)}
          >
            <Edit />
          </IconButton>

          <IconButton
            data-testid={`delete-button-${event.id}`}
            aria-label="Delete event"
            onClick={() => onDelete(event.id)}
          >
            <Delete />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
