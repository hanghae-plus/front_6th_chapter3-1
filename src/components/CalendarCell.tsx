import { TableCell, Typography } from '@mui/material';

import type { Event } from '../types';
import { CalendarEventItem } from './CalendarEventItem';
import { formatDate, getEventsForDay } from '../utils/dateUtils';

type CalendarCellProps = {
  day: number | null;
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
};

export function CalendarCell({
  day,
  currentDate,
  events,
  notifiedEvents,
  holidays,
}: CalendarCellProps) {
  if (!day) {
    return (
      <TableCell
        sx={{
          height: '120px',
          verticalAlign: 'top',
          width: '14.28%',
          padding: 1,
          border: '1px solid #e0e0e0',
        }}
      />
    );
  }

  const dateString = formatDate(currentDate, day);
  const holiday = holidays[dateString];
  const dayEvents = getEventsForDay(events, day);

  return (
    <TableCell
      sx={{
        height: '120px',
        verticalAlign: 'top',
        width: '14.28%',
        padding: 1,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Typography variant="body2" fontWeight="bold">
        {day}
      </Typography>
      {holiday && (
        <Typography variant="body2" color="error">
          {holiday}
        </Typography>
      )}
      {dayEvents.map((event) => (
        <CalendarEventItem
          key={event.id}
          event={event}
          isNotified={notifiedEvents.includes(event.id)}
        />
      ))}
    </TableCell>
  );
}
