import { render, screen } from '@testing-library/react';

import { CalendarViewComponent } from '../../components/CalendarView';
import { createEvent } from '../utils';

const events = [
  createEvent({
    id: '1',
    title: 'Event 1',
    date: '2025-08-22',
    startTime: '09:00',
    endTime: '10:00',
  }),
];

describe('CalendarMonthView', () => {
  it('month 뷰에서 8월은 1일부터 31일까지 랜더링된다', () => {
    render(<CalendarViewComponent events={events} notifiedEvents={[]} />);

    expect(screen.getByText('2025년 8월')).toBeInTheDocument();
    const cellsWithParagraphs = screen
      .getAllByRole('cell')
      .filter((cell) => cell.querySelector('p') !== null);
    expect(cellsWithParagraphs).toHaveLength(31);

    expect(cellsWithParagraphs[0]).toHaveTextContent('1');
    expect(cellsWithParagraphs[30]).toHaveTextContent('31');
  });
});
