import { FormControl, FormLabel, MenuItem, Select } from '@mui/material';

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

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
