import { FormControl, FormLabel, TextField } from '@mui/material';
import React from 'react';

export const BasicInfoForm = ({
  title,
  setTitle,
  date,
  setDate,
}: {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  setDate: (value: React.SetStateAction<string>) => void;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <>
      <FormControl fullWidth>
        <FormLabel htmlFor="title">제목</FormLabel>
        <TextField
          id="title"
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="date">날짜</FormLabel>
        <TextField
          id="date"
          size="small"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </FormControl>
    </>
  );
};
