import { render, screen } from '@testing-library/react';
import { EventList } from '../../components/EventList';
import { vi } from 'vitest';

describe('EventList', () => {
  it('컴포넌트가 "일정 검색" 필드와 함께 올바르게 렌더링된다', () => {
    render(
      <EventList
        searchTerm=""
        setSearchTerm={vi.fn()}
        filteredEvents={[]}
        notifiedEvents={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByLabelText('일정 검색')).toBeInTheDocument();
  });
});
