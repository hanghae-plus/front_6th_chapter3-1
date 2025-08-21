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

import { useEventForm } from '../../hooks/useEventForm';
import { Event, EventForm } from '../../types';
import { getTimeErrorMessage } from '../../utils/timeValidation';

const categories = ['업무', '개인', '가족', '기타'];

const EventEditForm = ({
  findOverlappingEvents,
  setIsOverlapDialogOpen,
  setOverlappingEvents,
  saveEvent,
  events,
  notificationOptions,
  editingEvent,
}) => {
  const { formState, handleChange, resetForm } = useEventForm(editingEvent);

  const { startTimeError, endTimeError } = getTimeErrorMessage(
    formState.startTime,
    formState.endTime
  );

  const { enqueueSnackbar } = useSnackbar();

  const addOrUpdateEvent = async () => {
    if (!formState.title || !formState.date || !formState.startTime || !formState.endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventForm = {
      ...editingEvent,
      ...formState,
      id: editingEvent ? editingEvent.id : undefined,
      repeat: {
        type: formState.isRepeating ? formState.repeatType : 'none',
        interval: formState.repeatInterval,
        endDate: formState.repeatEndDate || undefined,
      },
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
          name="title"
          size="small"
          value={formState.title}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="date">날짜</FormLabel>
        <TextField
          id="date"
          name="date"
          size="small"
          type="date"
          value={formState.date}
          onChange={handleChange}
        />
      </FormControl>

      <Stack direction="row" spacing={2}>
        <FormControl fullWidth>
          <FormLabel htmlFor="start-time">시작 시간</FormLabel>
          <Tooltip title={startTimeError || ''} open={!!startTimeError} placement="top">
            <TextField
              id="start-time"
              name="startTime"
              size="small"
              type="time"
              value={formState.startTime}
              onChange={handleChange}
              onBlur={() => getTimeErrorMessage(formState.startTime, formState.endTime)}
              error={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl fullWidth>
          <FormLabel htmlFor="end-time">종료 시간</FormLabel>
          <Tooltip title={endTimeError || ''} open={!!endTimeError} placement="top">
            <TextField
              id="end-time"
              name="endTime"
              size="small"
              type="time"
              value={formState.endTime}
              onChange={handleChange}
              onBlur={() => getTimeErrorMessage(formState.startTime, formState.endTime)}
              error={!!endTimeError}
            />
          </Tooltip>
        </FormControl>
      </Stack>

      <FormControl fullWidth>
        <FormLabel htmlFor="description">설명</FormLabel>
        <TextField
          id="description"
          name="description"
          size="small"
          value={formState.description}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="location">위치</FormLabel>
        <TextField
          id="location"
          name="location"
          size="small"
          value={formState.location}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel id="category-label">카테고리</FormLabel>
        <Select
          id="category"
          name="category"
          size="small"
          value={formState.category}
          onChange={handleChange}
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
            <Checkbox name="isRepeating" checked={formState.isRepeating} onChange={handleChange} />
          }
          label="반복 일정"
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="notification">알림 설정</FormLabel>
        <Select
          id="notification"
          name="notificationTime"
          size="small"
          value={formState.notificationTime}
          onChange={handleChange}
          data-testid="notification-select"
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
    </Stack>
  );
};

export default EventEditForm;
