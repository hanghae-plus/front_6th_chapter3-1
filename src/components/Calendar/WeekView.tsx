import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Event } from '../../types';
import { formatWeek, getWeekDates } from '../../utils/dateUtils';
import { EventItem } from './EventItem';

interface WeekViewProps {
  currentDate: Date;
  filteredEvents: Event[];
  notifiedEvents: string[];
  weekDays: string[];
}

export const WeekView = ({
  currentDate,
  filteredEvents,
  notifiedEvents,
  weekDays,
}: WeekViewProps) => {
  const weekDates = getWeekDates(currentDate);

  return (
    <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
      <Typography variant="h5">{formatWeek(currentDate)}</Typography>
      <TableContainer>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {weekDays.map((day) => (
                <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {weekDates.map((date) => (
                <TableCell
                  key={date.toISOString()}
                  sx={{
                    height: '120px',
                    verticalAlign: 'top',
                    width: '14.28%',
                    padding: 1,
                    border: '1px solid #e0e0e0',
                    overflow: 'hidden',
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {date.getDate()}
                  </Typography>
                  {filteredEvents
                    .filter((event) => new Date(event.date).toDateString() === date.toDateString())
                    .map((event) => (
                      <EventItem
                        key={event.id}
                        event={event}
                        isNotified={notifiedEvents.includes(event.id)}
                      />
                    ))}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
