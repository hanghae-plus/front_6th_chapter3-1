import { Stack, FormControl, FormLabel, Tooltip, TextField } from '@mui/material';
import React from 'react';

export const TimeForm = ({
  startTime,
  endTime,
  startTimeError,
  endTimeError,
  handleStartTimeChange,
  handleEndTimeChange,
}: {
  startTime: string;
  endTime: string;
  startTimeError: string | null;
  endTimeError: string | null;
  handleStartTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEndTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
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
            error={!!endTimeError}
          />
        </Tooltip>
      </FormControl>
    </Stack>
  );
};
