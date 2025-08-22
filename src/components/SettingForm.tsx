import {
  FormControl,
  FormControlLabel,
  Checkbox,
  FormLabel,
  Select,
  MenuItem,
} from '@mui/material';
import React from 'react';

import { notificationOptions } from '../data';

export const SettingForm = ({
  isRepeating,
  setIsRepeating,
  notificationTime,
  setNotificationTime,
}: {
  isRepeating: boolean;
  repeatEndDate: string;
  notificationTime: number;
  setIsRepeating: (value: React.SetStateAction<boolean>) => void;
  setNotificationTime: (value: React.SetStateAction<number>) => void;
}) => {
  return (
    <>
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
    </>
  );
};
