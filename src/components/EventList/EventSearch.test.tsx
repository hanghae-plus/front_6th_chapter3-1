import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { EventSearch } from './EventSearch';

describe('<EventSearch />', () => {
  it('라벨과 placeholder가 렌더링된다', () => {
    render(<EventSearch searchTerm="" onSearchChange={vi.fn()} />);

    // 라벨
    expect(screen.getByText('일정 검색')).toBeInTheDocument();

    // placeholder
    expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
  });

  it('searchTerm 값이 반영된다', () => {
    render(<EventSearch searchTerm="팀 회의" onSearchChange={vi.fn()} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('팀 회의');
  });
});
