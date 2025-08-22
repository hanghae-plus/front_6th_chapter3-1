import { FormControl, FormLabel, Stack, TextField } from '@mui/material';
import type { ChangeEvent } from 'react';

type BasicInfoFieldsProps = {
  title: string;
  date: string;
  description: string;
  location: string;
  onTitleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onLocationChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function BasicInfoFields({
  title,
  date,
  description,
  location,
  onTitleChange,
  onDateChange,
  onDescriptionChange,
  onLocationChange,
}: BasicInfoFieldsProps) {
  return (
    <Stack spacing={2}>
      <FormControl fullWidth>
        <FormLabel htmlFor="title">제목</FormLabel>
        <TextField id="title" size="small" value={title} onChange={onTitleChange} />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="date">날짜</FormLabel>
        <TextField id="date" size="small" type="date" value={date} onChange={onDateChange} />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="description">설명</FormLabel>
        <TextField
          id="description"
          size="small"
          value={description}
          onChange={onDescriptionChange}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="location">위치</FormLabel>
        <TextField id="location" size="small" value={location} onChange={onLocationChange} />
      </FormControl>
    </Stack>
  );
}
