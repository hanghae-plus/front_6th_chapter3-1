import { FormControl, FormLabel, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

const categories = ['업무', '개인', '가족', '기타'];

type CategorySelectProps = {
  category: string;
  onChange: (e: SelectChangeEvent<string>) => void;
};

export function CategorySelect({ category, onChange }: CategorySelectProps) {
  return (
    <FormControl fullWidth>
      <FormLabel id="category-label">카테고리</FormLabel>
      <Select
        id="category"
        size="small"
        value={category}
        onChange={onChange}
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
}
