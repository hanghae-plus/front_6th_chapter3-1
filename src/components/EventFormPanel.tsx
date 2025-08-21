import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { getTimeErrorMessage } from '../utils/timeValidation';
import { CATEGORIES, NOTIFICATION_OPTIONS } from '../constant/calendar';
import { Event, RepeatType } from '../types';

interface EventFormPanelProps {
  editingEvent: Event | null;
  eventForm: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
    category: string;
    isRepeating: boolean;
    repeatType: RepeatType;
    repeatInterval: number;
    repeatEndDate: string;
    notificationTime: number;
  };
  setEventForm: Dispatch<
    SetStateAction<{
      title: string;
      date: string;
      startTime: string;
      endTime: string;
      description: string;
      location: string;
      category: string;
      isRepeating: boolean;
      repeatType: RepeatType;
      repeatInterval: number;
      repeatEndDate: string;
      notificationTime: number;
    }>
  >;
  startTimeError: string | null;
  endTimeError: string | null;
  handleStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  addOrUpdateEvent: () => void;
}

export const EventFormPanel = ({
  editingEvent,
  eventForm,
  setEventForm,
  startTimeError,
  endTimeError,
  handleStartTimeChange,
  handleEndTimeChange,
  addOrUpdateEvent,
}: EventFormPanelProps) => {
  return (
    <Stack spacing={2} sx={{ width: '20%' }}>
      <Typography variant="h4">{editingEvent ? '일정 수정' : '일정 추가'}</Typography>

      <FormControl fullWidth>
        <FormLabel htmlFor="title">제목</FormLabel>
        <TextField
          id="title"
          size="small"
          value={eventForm.title}
          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="date">날짜</FormLabel>
        <TextField
          id="date"
          size="small"
          type="date"
          value={eventForm.date}
          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
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
              value={eventForm.startTime}
              onChange={handleStartTimeChange}
              onBlur={() => getTimeErrorMessage(eventForm.startTime, eventForm.endTime)}
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
              value={eventForm.endTime}
              onChange={handleEndTimeChange}
              onBlur={() => getTimeErrorMessage(eventForm.startTime, eventForm.endTime)}
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
          value={eventForm.description}
          onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="location">위치</FormLabel>
        <TextField
          id="location"
          size="small"
          value={eventForm.location}
          onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel id="category-label">카테고리</FormLabel>
        <Select
          id="category"
          size="small"
          value={eventForm.category}
          onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
          aria-labelledby="category-label"
          aria-label="카테고리"
        >
          {CATEGORIES.map((cat) => (
            <MenuItem key={cat} value={cat} aria-label={`${cat}-option`}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={eventForm.isRepeating}
              onChange={(e) => setEventForm({ ...eventForm, isRepeating: e.target.checked })}
            />
          }
          label="반복 일정"
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="notification">알림 설정</FormLabel>
        <Select
          id="notification"
          size="small"
          value={eventForm.notificationTime}
          onChange={(e) => setEventForm({ ...eventForm, notificationTime: Number(e.target.value) })}
        >
          {NOTIFICATION_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
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
