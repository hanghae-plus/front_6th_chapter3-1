import { FormControl, FormLabel, Stack, TextField, Tooltip } from '@mui/material';
import type { ChangeEvent } from 'react';

import { getTimeErrorMessage } from '../utils/timeValidation';

type TimeRangeFieldsProps = {
  startTime: string;
  endTime: string;
  startTimeError: string | null;
  endTimeError: string | null;
  handleStartTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function TimeRangeFields({
  startTime,
  endTime,
  startTimeError,
  endTimeError,
  handleStartTimeChange,
  handleEndTimeChange,
}: TimeRangeFieldsProps) {
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
  );
}
