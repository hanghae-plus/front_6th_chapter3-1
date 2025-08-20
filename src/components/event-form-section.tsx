import {
  Stack,
  Typography,
  FormControl,
  FormLabel,
  TextField,
  Tooltip,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
} from '@mui/material';
import { Dispatch, SetStateAction, ChangeEventHandler } from 'react';

import { Event } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

type NotificationOption = { value: number; label: string };

type Props = {
  editingEvent: Event | null;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  date: string;
  setDate: Dispatch<SetStateAction<string>>;
  startTime: string;
  endTime: string;
  handleStartTimeChange: ChangeEventHandler<HTMLInputElement>;
  handleEndTimeChange: ChangeEventHandler<HTMLInputElement>;
  startTimeError: string | null;
  endTimeError: string | null;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  location: string;
  setLocation: Dispatch<SetStateAction<string>>;
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  categories: string[];
  isRepeating: boolean;
  setIsRepeating: Dispatch<SetStateAction<boolean>>;
  notificationTime: number;
  setNotificationTime: Dispatch<SetStateAction<number>>;
  notificationOptions: NotificationOption[];
  addOrUpdateEvent: () => void | Promise<void>;
};

export const EventFormSection = ({
  editingEvent,
  title,
  setTitle,
  date,
  setDate,
  startTime,
  endTime,
  handleStartTimeChange,
  handleEndTimeChange,
  startTimeError,
  endTimeError,
  description,
  setDescription,
  location,
  setLocation,
  category,
  setCategory,
  categories,
  isRepeating,
  setIsRepeating,
  notificationTime,
  setNotificationTime,
  notificationOptions,
  addOrUpdateEvent,
}: Props) => {
  return (
    <Stack spacing={2} sx={{ width: '20%' }}>
      <Typography variant="h4">{editingEvent ? '일정 수정' : '일정 추가'}</Typography>

      <FormControl fullWidth>
        <FormLabel htmlFor="title">제목</FormLabel>
        <TextField
          id="title"
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="date">날짜</FormLabel>
        <TextField
          id="date"
          size="small"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </FormControl>

      <Stack direction="row" spacing={2}>
        <FormControl fullWidth>
          <FormLabel htmlFor="start-time">시작 시간</FormLabel>
          <Tooltip title={startTimeError || ''} open={!!startTimeError} placement="top">
            <TextField
              id="start-time"
              size="small"
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              error={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl fullWidth>
          <FormLabel htmlFor="end-time">종료 시간</FormLabel>
          <Tooltip title={endTimeError || ''} open={!!endTimeError} placement="top">
            <TextField
              id="end-time"
              size="small"
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(startTime, endTime)}
              error={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </Stack>

      <FormControl fullWidth>
        <FormLabel htmlFor="description">설명</FormLabel>
        <TextField
          id="description"
          size="small"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="location">위치</FormLabel>
        <TextField
          id="location"
          size="small"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel id="category-label">카테고리</FormLabel>
        <Select
          id="category"
          size="small"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-labelledby="category-label"
          aria-label="카테고리"
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category} aria-label={`${category}-option`}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormControlLabel
          control={
            <Checkbox checked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)} />
          }
          label="반복 일정"
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel id="notification-label" htmlFor="notification">
          알림 설정
        </FormLabel>
        <Select
          id="notification"
          size="small"
          value={notificationTime}
          aria-labelledby="notification-label"
          aria-label="알림 설정"
          onChange={(e) => setNotificationTime(Number(e.target.value))}
        >
          {notificationOptions.map((option) => (
            <MenuItem key={option.value} value={option.value} aria-label={`${option.label}-option`}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ! 반복은 8주차 과제에 포함됩니다. 구현하고 싶어도 참아주세요~ */}
      {/* {isRepeating && (
      <Stack spacing={2}>
        <FormControl fullWidth>
          <FormLabel>반복 유형</FormLabel>
          <Select
            size="small"
            value={repeatType}
            onChange={(e) => setRepeatType(e.target.value as RepeatType)}
          >
            <MenuItem value="daily">매일</MenuItem>
            <MenuItem value="weekly">매주</MenuItem>
            <MenuItem value="monthly">매월</MenuItem>
            <MenuItem value="yearly">매년</MenuItem>
          </Select>
        </FormControl>
        <Stack direction="row" spacing={2}>
          <FormControl fullWidth>
            <FormLabel>반복 간격</FormLabel>
            <TextField
              size="small"
              type="number"
              value={repeatInterval}
              onChange={(e) => setRepeatInterval(Number(e.target.value))}
              slotProps={{ htmlInput: { min: 1 } }}
            />
          </FormControl>
          <FormControl fullWidth>
            <FormLabel>반복 종료일</FormLabel>
            <TextField
              size="small"
              type="date"
              value={repeatEndDate}
              onChange={(e) => setRepeatEndDate(e.target.value)}
            />
          </FormControl>
        </Stack>
      </Stack>
    )} */}

      <Button
        data-testid="event-submit-button"
        onClick={addOrUpdateEvent}
        variant="contained"
        color="primary"
      >
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Button>
    </Stack>
  );
};
