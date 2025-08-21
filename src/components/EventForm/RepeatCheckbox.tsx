import { Checkbox, FormControl, FormControlLabel } from '@mui/material';

interface RepeatCheckboxProps {
  isRepeating: boolean;
  onChange: (checked: boolean) => void;
}

export const RepeatCheckbox = ({ isRepeating, onChange }: RepeatCheckboxProps) => {
  return (
    <FormControl>
      <FormControlLabel
        control={<Checkbox checked={isRepeating} onChange={(e) => onChange(e.target.checked)} />}
        label="반복 일정"
      />
    </FormControl>
  );
};
