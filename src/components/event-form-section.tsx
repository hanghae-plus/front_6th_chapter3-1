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
import { useSnackbar } from 'notistack';

import { useEventForm, useEventOperations } from '../hooks';
import { openOverlappingDialog } from './overlapping-dialog';
import { findOverlappingEvents } from '../utils/eventOverlap';
import { getTimeErrorMessage } from '../utils/timeValidation';

type NotificationOption = { value: number; label: string };

type Props = {
  categories: string[];
  notificationOptions: NotificationOption[];
};

export const EventFormSection = ({ categories, notificationOptions }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    form,
    errors,
    editingEvent,
    onChangeStartTime,
    onChangeEndTime,
    resetForm,
    getEventFormData,

    updateField,
  } = useEventForm();
  const { events, saveEvent } = useEventOperations(Boolean(editingEvent));

  const addOrUpdateEvent = async () => {
    if (!form.title || !form.date || !form.startTime || !form.endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (errors.startTimeError || errors.endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData = getEventFormData();
    const overlapping = findOverlappingEvents(eventData, events);

    if (overlapping.length > 0) {
      openOverlappingDialog({
        events: overlapping,
        onSubmit: () => {
          saveEvent(eventData);
          resetForm();
        },
      });
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
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="date">날짜</FormLabel>
        <TextField
          id="date"
          size="small"
          type="date"
          value={form.date}
          onChange={(e) => updateField('date', e.target.value)}
        />
      </FormControl>

      <Stack direction="row" spacing={2}>
        <FormControl fullWidth>
          <FormLabel htmlFor="start-time">시작 시간</FormLabel>
          <Tooltip
            title={errors.startTimeError || ''}
            open={!!errors.startTimeError}
            placement="top"
          >
            <TextField
              id="start-time"
              size="small"
              type="time"
              value={form.startTime}
              onChange={(e) => onChangeStartTime(e.target.value)}
              onBlur={() => getTimeErrorMessage(form.startTime, form.endTime)}
              error={!!errors.startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl fullWidth>
          <FormLabel htmlFor="end-time">종료 시간</FormLabel>
          <Tooltip title={errors.endTimeError || ''} open={!!errors.endTimeError} placement="top">
            <TextField
              id="end-time"
              size="small"
              type="time"
              value={form.endTime}
              onChange={(e) => onChangeEndTime(e.target.value)}
              onBlur={() => getTimeErrorMessage(form.startTime, form.endTime)}
              error={!!errors.endTimeError}
            />
          </Tooltip>
        </FormControl>
      </Stack>

      <FormControl fullWidth>
        <FormLabel htmlFor="description">설명</FormLabel>
        <TextField
          id="description"
          size="small"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="location">위치</FormLabel>
        <TextField
          id="location"
          size="small"
          value={form.location}
          onChange={(e) => updateField('location', e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel id="category-label">카테고리</FormLabel>
        <Select
          id="category"
          size="small"
          value={form.category}
          onChange={(e) => updateField('category', e.target.value)}
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
            <Checkbox
              checked={form.isRepeating}
              onChange={(e) => updateField('isRepeating', e.target.checked)}
            />
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
          value={form.notificationTime}
          aria-labelledby="notification-label"
          aria-label="알림 설정"
          onChange={(e) => updateField('notificationTime', Number(e.target.value))}
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
