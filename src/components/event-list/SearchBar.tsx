import { FormControl, FormLabel, TextField } from '@mui/material';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <FormControl fullWidth>
      <FormLabel htmlFor="search">일정 검색</FormLabel>
      <TextField
        id="search"
        size="small"
        placeholder="검색어를 입력하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </FormControl>
  );
};

export default SearchBar;
