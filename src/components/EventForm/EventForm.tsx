import { Button, Stack, Typography } from '@mui/material';
import { ChangeEvent } from 'react';

import { BasicFields } from './BasicFields';
import { CategorySelect } from './CategorySelect';
import { NotificationSelect } from './NotificationSelect';
import { RepeatCheckbox } from './RepeatCheckbox';
import { TimeFields } from './TimeFields';
import { Event } from '../../types';

interface EventFormProps {
  title: string;
  setTitle: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  startTime: string;
  endTime: string;
  description: string;
  setDescription: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  isRepeating: boolean;
  setIsRepeating: (value: boolean) => void;
  notificationTime: number;
  setNotificationTime: (value: number) => void;
  startTimeError: string | null;
  endTimeError: string | null;
  editingEvent: Event | null;
  handleStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTimeBlur: () => void;
  onSubmit: () => void;
}

export const EventForm = ({
  title,
  setTitle,
  date,
  setDate,
  startTime,
  endTime,
  description,
  setDescription,
  location,
  setLocation,
  category,
  setCategory,
  isRepeating,
  setIsRepeating,
  notificationTime,
  setNotificationTime,
  startTimeError,
  endTimeError,
  editingEvent,
  handleStartTimeChange,
  handleEndTimeChange,
  onTimeBlur,
  onSubmit,
}: EventFormProps) => {
  return (
    <Stack spacing={2} sx={{ width: '20%' }}>
      <Typography variant="h4">{editingEvent ? '일정 수정' : '일정 추가'}</Typography>

      <BasicFields
        title={title}
        setTitle={setTitle}
        date={date}
        setDate={setDate}
        description={description}
        setDescription={setDescription}
        location={location}
        setLocation={setLocation}
      />

      <TimeFields
        startTime={startTime}
        endTime={endTime}
        startTimeError={startTimeError}
        endTimeError={endTimeError}
        onStartTimeChange={handleStartTimeChange}
        onEndTimeChange={handleEndTimeChange}
        onTimeBlur={onTimeBlur}
      />

      <CategorySelect value={category} onChange={setCategory} />

      <RepeatCheckbox isRepeating={isRepeating} onChange={setIsRepeating} />

      <NotificationSelect value={notificationTime} onChange={setNotificationTime} />

      <Button
        data-testid="event-submit-button"
        onClick={onSubmit}
        variant="contained"
        color="primary"
      >
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </Stack>
  );
};
