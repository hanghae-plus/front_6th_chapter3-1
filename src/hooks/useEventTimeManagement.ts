import { ChangeEvent, useState } from 'react';
import { Event } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

export const useEventTimeManagement = (initialEvent?: Event) => {
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '');
  const [endTime, setEndTime] = useState(initialEvent?.endTime || '');

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const handleStartTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    setTimeError(getTimeErrorMessage(newStartTime, endTime));
  };

  const handleEndTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    setTimeError(getTimeErrorMessage(startTime, newEndTime));
  };

  const resetTime = () => {
    setStartTime('');
    setEndTime('');
    setTimeError({ startTimeError: null, endTimeError: null });
  };

  const editTime = (event: Event) => {
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setTimeError({ startTimeError: null, endTimeError: null });
  };

  return {
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    setTimeError,
    startTimeError,
    endTimeError,
    handleStartTimeChange,
    handleEndTimeChange,
    resetTime,
    editTime,
  };
};
