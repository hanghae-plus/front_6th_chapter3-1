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
import { formatMonth, getWeeksAtMonth } from '../utils/dateUtils';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

type MonthViewProps = {
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
};

export function MonthView({ currentDate, events, notifiedEvents, holidays }: MonthViewProps) {
  const weeks = getWeeksAtMonth(currentDate);

  return (
    <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
      <Typography variant="h5">{formatMonth(currentDate)}</Typography>
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
            {weeks.map((week, weekIndex) => (
              <TableRow key={weekIndex}>
                {week.map((day, dayIndex) => (
                  <CalendarCell
                    key={dayIndex}
                    day={day}
                    currentDate={currentDate}
                    events={events}
                    notifiedEvents={notifiedEvents}
                    holidays={holidays}
                  />
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
