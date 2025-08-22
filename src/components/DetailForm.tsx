import { FormControl, FormLabel, TextField, Select, MenuItem } from '@mui/material';
import React from 'react';

import { categories } from '../data';

export const DetailForm = ({
  description,
  setDescription,
  location,
  setLocation,
  category,
  setCategory,
}: {
  description: string;
  location: string;
  category: string;
  setDescription: (value: React.SetStateAction<string>) => void;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <>
      <FormControl fullWidth>
        <FormLabel htmlFor="description">설명</FormLabel>
        <TextField
          id="description"
          size="small"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel htmlFor="location">위치</FormLabel>
        <TextField
          id="location"
          size="small"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth>
        <FormLabel id="category-label">카테고리</FormLabel>
        <Select
          id="category"
          size="small"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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
    </>
  );
};
