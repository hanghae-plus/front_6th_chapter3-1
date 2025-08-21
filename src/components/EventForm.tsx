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
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { OverlapDialog } from './OverlapDialog';
import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';
import { getTimeErrorMessage } from '../utils/timeValidation';

const categories = ['업무', '개인', '가족', '기타'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

interface EventFormProps {
  events: Event[];
  eventForm: ReturnType<typeof import('../hooks/useEventForm').useEventForm>;
  saveEvent: (eventData: Event | EventForm) => Promise<void>;
}

export function EventFormComponent({ events, eventForm, saveEvent }: EventFormProps) {
  const {
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
    repeatType,
    repeatInterval,
    repeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
  } = eventForm;

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

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
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat} aria-label={`${cat}-option`}>
              {cat}
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
        <FormLabel htmlFor="notification">알림 설정</FormLabel>
        <Select
          id="notification"
          size="small"
          value={notificationTime}
          onChange={(e) => setNotificationTime(Number(e.target.value))}
        >
          {notificationOptions.map((option) => (
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

      <OverlapDialog
        isOpen={isOverlapDialogOpen}
        overlappingEvents={overlappingEvents}
        onClose={() => setIsOverlapDialogOpen(false)}
        onConfirm={() => {
          setIsOverlapDialogOpen(false);
          saveEvent({
            id: editingEvent ? editingEvent.id : undefined,
            title,
            date,
            startTime,
            endTime,
            description,
            location,
            category,
            repeat: {
              type: isRepeating ? repeatType : 'none',
              interval: repeatInterval,
              endDate: repeatEndDate || undefined,
            },
            notificationTime,
          });
        }}
      />
    </Stack>
  );
}
