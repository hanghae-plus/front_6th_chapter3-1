import {
  Stack,
  Typography,
  FormControl,
  FormLabel,
  TextField,
  Tooltip,
  Button,
  Checkbox,
  Select,
  MenuItem,
  FormControlLabel,
} from '@mui/material';

import { categories, notificationOptions } from '../constants';
import { Event } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

interface EventFormProps {
  formData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
    category: string;
    isRepeating: boolean;
    repeatType: string;
    repeatInterval: number;
    repeatEndDate: string;
    notificationTime: number;
  };
  errors: {
    startTimeError: string;
    endTimeError: string;
  };
  editingEvent: Event | null;
  onInputChange: (_field: string, _value: string | number | boolean) => void;
  onSubmit: () => void;
}

export default function EventForm({
  formData,
  errors,
  editingEvent,
  onInputChange,
  onSubmit,
}: EventFormProps) {
  const {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    isRepeating,
    notificationTime,
  } = formData;

  const { startTimeError, endTimeError } = errors;

  const handleTimeValidation = () => {
    getTimeErrorMessage(startTime, endTime);
  };

  return (
    <Stack data-testid="event-form" spacing={2} sx={{ width: '20%' }}>
      <Typography data-testid="form-title" variant="h4">
        {editingEvent ? '일정 수정' : '일정 추가'}
      </Typography>

      <FormControl fullWidth>
        <FormLabel htmlFor="title">제목</FormLabel>
        <TextField
          id="title"
          size="small"
          value={title}
          onChange={(e) => onInputChange('title', e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="date">날짜</FormLabel>
        <TextField
          id="date"
          size="small"
          type="date"
          value={date}
          onChange={(e) => onInputChange('date', e.target.value)}
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
              onChange={(e) => onInputChange('startTime', e.target.value)}
              onBlur={handleTimeValidation}
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
              onChange={(e) => onInputChange('endTime', e.target.value)}
              onBlur={handleTimeValidation}
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
          onChange={(e) => onInputChange('description', e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="location">위치</FormLabel>
        <TextField
          id="location"
          size="small"
          value={location}
          onChange={(e) => onInputChange('location', e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel id="category-label">카테고리</FormLabel>
        <Select
          id="category"
          data-testid="category-select"
          size="small"
          value={category}
          onChange={(e) => onInputChange('category', e.target.value)}
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
            <Checkbox
              checked={isRepeating}
              onChange={(e) => onInputChange('isRepeating', e.target.checked)}
            />
          }
          label="반복 일정"
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="notification">알림 설정</FormLabel>
        <Select
          id="notification"
          data-testid="notification-select"
          size="small"
          value={notificationTime}
          onChange={(e) => onInputChange('notificationTime', Number(e.target.value))}
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
              onChange={(e) => onInputChange('repeatType', e.target.value)}
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
                onChange={(e) => onInputChange('repeatInterval', Number(e.target.value))}
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </FormControl>
            <FormControl fullWidth>
              <FormLabel>반복 종료일</FormLabel>
              <TextField
                size="small"
                type="date"
                value={repeatEndDate}
                onChange={(e) => onInputChange('repeatEndDate', e.target.value)}
              />
            </FormControl>
          </Stack>
        </Stack>
      )} */}

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
