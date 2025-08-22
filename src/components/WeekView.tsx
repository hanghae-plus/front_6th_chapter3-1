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

import type { Event } from '../types';
import { CalendarCell } from './CalendarCell';
import { formatWeek, getWeekDates } from '../utils/dateUtils';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

type WeekViewProps = {
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
};

export function WeekView({ currentDate, events, notifiedEvents, holidays }: WeekViewProps) {
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
                <CalendarCell
                  key={date.toISOString()}
                  day={date.getDate()}
                  currentDate={date}
                  events={events}
                  notifiedEvents={notifiedEvents}
                  holidays={holidays}
                />
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
