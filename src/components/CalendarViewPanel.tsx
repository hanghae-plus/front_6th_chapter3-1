import { Stack, Typography } from '@mui/material';

import CalendarToolbar from './CalendarToolbar';
import MonthView from './MonthView';
import WeekView from './WeekView';
import { Event } from '../types';

interface CalendarViewPanelProps {
  title?: string;
  view: 'week' | 'month';
  onChangeView: (_value: 'week' | 'month') => void;
  onPrev: () => void;
  onNext: () => void;
  weekDays: string[];
  currentDate: Date;
  formatWeek: (_date: Date) => string;
  getWeekDates: (_date: Date) => Date[];
  formatMonth: (_date: Date) => string;
  getWeeksAtMonth: (_date: Date) => Array<Array<number | null>>;
  getEventsForDay: (_events: Event[], _day: number) => Event[];
  formatDate: (_date: Date, _day?: number) => string;
  holidays: Record<string, string>;
  events: Event[];
  notifiedEvents: string[];
}

export default function CalendarViewPanel(props: CalendarViewPanelProps) {
  const {
    title = '일정 보기',
    view,
    onChangeView,
    onPrev,
    onNext,
    weekDays,
    currentDate,
    formatWeek,
    getWeekDates,
    formatMonth,
    getWeeksAtMonth,
    getEventsForDay,
    formatDate,
    holidays,
    events,
    notifiedEvents,
  } = props;

  return (
    <Stack flex={1} spacing={5}>
      <Typography variant="h4">{title}</Typography>
      <CalendarToolbar view={view} onChangeView={onChangeView} onPrev={onPrev} onNext={onNext} />
      {view === 'week' && (
        <WeekView
          weekDays={weekDays}
          currentDate={currentDate}
          formatWeek={formatWeek}
          getWeekDates={getWeekDates}
          events={events}
          notifiedEvents={notifiedEvents}
        />
      )}
      {view === 'month' && (
        <MonthView
          weekDays={weekDays}
          currentDate={currentDate}
          formatMonth={formatMonth}
          getWeeksAtMonth={getWeeksAtMonth}
          getEventsForDay={getEventsForDay}
          formatDate={formatDate}
          holidays={holidays}
          events={events}
          notifiedEvents={notifiedEvents}
        />
      )}
    </Stack>
  );
}
