import { Button, Checkbox, FormControl, FormControlLabel, Stack, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { ChangeEvent } from 'react';

import type { Event } from '../types';
import { BasicInfoFields } from './BasicInfoFields';
import { CategorySelect } from './CategorySelect';
import { NotificationSelect } from './NotificationSelect';
import { TimeRangeFields } from './TimeRangeFields';

type EventFormProps = {
  // 폼 상태
  title: string;
  setTitle: (title: string) => void;
  date: string;
  setDate: (date: string) => void;
  startTime: string;
  endTime: string;
  description: string;
  setDescription: (description: string) => void;
  location: string;
  setLocation: (location: string) => void;
  category: string;
  setCategory: (category: string) => void;
  isRepeating: boolean;
  setIsRepeating: (isRepeating: boolean) => void;
  notificationTime: number;
  setNotificationTime: (time: number) => void;

  // 시간 관련
  startTimeError: string | null;
  endTimeError: string | null;
  handleStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;

  // 편집 상태
  editingEvent: Event | null;

  // 액션
  onSubmit: () => Promise<void>;
};

export function EventForm({
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
  handleStartTimeChange,
  handleEndTimeChange,
  editingEvent,
  onSubmit,
}: EventFormProps) {
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setCategory(e.target.value);
  };

  const handleRepeatingChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsRepeating(e.target.checked);
  };

  const handleNotificationTimeChange = (e: SelectChangeEvent<number>) => {
    setNotificationTime(Number(e.target.value));
  };

  return (
    <Stack spacing={2} sx={{ width: '20%' }}>
      <Typography variant="h4">{editingEvent ? '일정 수정' : '일정 추가'}</Typography>

      <BasicInfoFields
        title={title}
        date={date}
        description={description}
        location={location}
        onTitleChange={handleTitleChange}
        onDateChange={handleDateChange}
        onDescriptionChange={handleDescriptionChange}
        onLocationChange={handleLocationChange}
      />
      <TimeRangeFields
        startTime={startTime}
        endTime={endTime}
        startTimeError={startTimeError}
        endTimeError={endTimeError}
        handleStartTimeChange={handleStartTimeChange}
        handleEndTimeChange={handleEndTimeChange}
      />

      <CategorySelect category={category} onChange={handleCategoryChange} />
      <FormControl>
        <FormControlLabel
          control={<Checkbox checked={isRepeating} onChange={handleRepeatingChange} />}
          label="반복 일정"
        />
      </FormControl>
      <NotificationSelect
        notificationTime={notificationTime}
        onChange={handleNotificationTimeChange}
      />
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
}
