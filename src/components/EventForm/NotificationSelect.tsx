import { FormControl, FormLabel, MenuItem, Select } from '@mui/material';

import { notificationOptions } from '../../constants/notificationOptions';

interface NotificationSelectProps {
  value: number;
  onChange: (value: number) => void;
}

export const NotificationSelect = ({ value, onChange }: NotificationSelectProps) => {
  return (
    <FormControl fullWidth>
      <FormLabel htmlFor="notification">알림 설정</FormLabel>
      <Select
        id="notification"
        size="small"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {notificationOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
