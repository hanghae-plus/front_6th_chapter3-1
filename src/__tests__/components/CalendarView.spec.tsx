import { render, screen } from '@testing-library/react';
import { CalendarView } from '../../components/CalendarView';
import { vi } from 'vitest';

describe('CalendarView', () => {
  it('컴포넌트가 "일정 보기" 제목과 함께 올바르게 렌더링된다', () => {
    render(
      <CalendarView
        view="month"
        setView={vi.fn()}
        currentDate={new Date()}
        navigate={vi.fn()}
        filteredEvents={[]}
        notifiedEvents={[]}
        holidays={{}}
      />
    );

    expect(screen.getByRole('heading', { name: '일정 보기' })).toBeInTheDocument();
  });
});
