import { render, renderHook, screen } from '@testing-library/react';

import { CalendarViewComponent } from '../../components/CalendarView';
import { createEvent } from '../utils';
import userEvent from '@testing-library/user-event';
import { useCalendarView } from '../../hooks/useCalendarView';

const events = [
  createEvent({
    id: '1',
    title: 'Event 1',
    date: '2025-08-22',
    startTime: '09:00',
    endTime: '10:00',
  }),
  createEvent({
    id: '2',
    title: 'Event 2',
    date: '2025-08-23',
    startTime: '09:00',
    endTime: '10:00',
  }),
];

describe('CalendarView', () => {
  it('초기 랜더링 시 month 뷰가 랜더링된다', () => {
    render(<CalendarViewComponent events={events} notifiedEvents={[]} />);

    expect(screen.getByTestId('month-view')).toBeInTheDocument();
    expect(screen.getByText('2025년 8월')).toBeInTheDocument();
  });

  it('week 뷰로 변경 시 week 뷰가 랜더링된다', async () => {
    render(<CalendarViewComponent events={events} notifiedEvents={[]} />);

    const viewSelect = screen.getByRole('combobox');
    await userEvent.click(viewSelect);
    await userEvent.click(screen.getByRole('option', { name: 'week-option' }));

    expect(screen.getByTestId('week-view')).toBeInTheDocument();
    expect(screen.getByText('2025년 8월 3주')).toBeInTheDocument();
  });

  it('해당 달력의 기간에 공휴일이 있으면 빨간색으로 표시된다', () => {
    render(<CalendarViewComponent events={events} notifiedEvents={[]} />);
    const { result } = renderHook(() => useCalendarView());

    expect(screen.getByText('2025년 8월')).toBeInTheDocument();
    expect(result.current.holidays).toEqual({
      '2025-08-15': '광복절',
    });
    expect(screen.getByText('광복절')).toHaveStyle('color: #d32f2f');
  });

  it('해당 달력의 기간에 이벤트가 있으면 배경이 회색으로 표시된다', () => {
    render(<CalendarViewComponent events={events} notifiedEvents={[]} />);

    expect(screen.getByText('2025년 8월')).toBeInTheDocument();
    const cellsWithEvents = screen
      .getAllByRole('cell')
      .filter((cell) => cell.querySelector('div') !== null);
    expect(cellsWithEvents.length).toBeGreaterThan(0);

    cellsWithEvents.forEach((cell) => {
      const eventDiv = cell.querySelector('div');
      expect(eventDiv).toHaveStyle('background-color: #f5f5f5');
    });
    expect(cellsWithEvents[0]).toHaveTextContent('Event 1');
  });
});

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
