import { FormControl, FormLabel, Stack, TextField, Tooltip } from '@mui/material';
import { ChangeEvent } from 'react';

interface TimeFieldsProps {
  startTime: string;
  endTime: string;
  startTimeError: string | null;
  endTimeError: string | null;
  onStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTimeBlur: () => void;
}

export const TimeFields = ({
  startTime,
  endTime,
  startTimeError,
  endTimeError,
  onStartTimeChange,
  onEndTimeChange,
  onTimeBlur,
}: TimeFieldsProps) => {
  return (
    <Stack direction="row" spacing={2}>
      <FormControl fullWidth>
        <FormLabel htmlFor="start-time">시작 시간</FormLabel>
        <Tooltip title={startTimeError || ''} open={!!startTimeError} placement="top">
          <TextField
            id="start-time"
            size="small"
            type="time"
            value={startTime}
            onChange={onStartTimeChange}
            onBlur={onTimeBlur}
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
            onChange={onEndTimeChange}
            onBlur={onTimeBlur}
            error={!!endTimeError}
          />
        </Tooltip>
      </FormControl>
    </Stack>
  );
};
