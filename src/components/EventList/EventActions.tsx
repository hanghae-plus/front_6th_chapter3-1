import { Delete, Edit } from '@mui/icons-material';
import { IconButton, Stack } from '@mui/material';
import { Event } from '../../types';

interface EventActionsProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export const EventActions = ({ event, onEdit, onDelete }: EventActionsProps) => {
  return (
    <Stack>
      <IconButton aria-label="Edit event" onClick={() => onEdit(event)}>
        <Edit />
      </IconButton>
      <IconButton aria-label="Delete event" onClick={() => onDelete(event.id)}>
        <Delete />
      </IconButton>
    </Stack>
  );
};
