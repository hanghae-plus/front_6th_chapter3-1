import { ChangeEvent, useState } from 'react';

import { getTimeErrorMessage } from '../utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

export const useEventTimeManager = () => {
  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const validateTime = (startTime: string, endTime: string) => {
    setTimeError(getTimeErrorMessage(startTime, endTime));
  };

  const createTimeChangeHandler = (
    timeType: 'start' | 'end',
    otherTime: string,
    setTime: (value: string) => void
  ) => {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const newTime = e.target.value;
      setTime(newTime);

      if (timeType === 'start') {
        setTimeError(getTimeErrorMessage(newTime, otherTime));
      } else {
        setTimeError(getTimeErrorMessage(otherTime, newTime));
      }
    };
  };

  const clearTimeErrors = () => {
    setTimeError({ startTimeError: null, endTimeError: null });
  };

  return {
    startTimeError,
    endTimeError,
    validateTime,
    createTimeChangeHandler,
    clearTimeErrors,
  };
};
