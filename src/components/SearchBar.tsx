import { FormControl, FormLabel, TextField } from '@mui/material';

export interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const SearchBar = ({ searchTerm, onSearchChange }: SearchBarProps) => {
  return (
    <FormControl fullWidth>
      <FormLabel htmlFor="search">일정 검색</FormLabel>
      <TextField
        id="search"
        size="small"
        placeholder="검색어를 입력하세요"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </FormControl>
  );
};
