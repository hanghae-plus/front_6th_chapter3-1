import { FormControl, FormLabel, MenuItem, Select } from '@mui/material';

const categories = ['업무', '개인', '가족', '기타'];

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const CategorySelect = ({ value, onChange }: CategorySelectProps) => {
  return (
    <FormControl fullWidth>
      <FormLabel id="category-label">카테고리</FormLabel>
      <Select
        id="category"
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  );
};
