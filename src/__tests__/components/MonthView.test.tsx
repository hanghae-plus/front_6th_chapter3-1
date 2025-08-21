import { render, screen, within } from '@testing-library/react';

import MonthView from '../../components/calendar/MonthView';
import { Event } from '../../types';

describe('MonthView Component', () => {
  const currentDate = new Date('2025-08-20');

  const mockEvents: Event[] = [
    {
      id: '1',
      title: '중요한 회의',
      date: '2025-08-22',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '테스트 이벤트',
      date: '2025-08-22',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  const mockHolidays = {
    '2025-08-15': '광복절',
  };

  it('현재 월, 요일, 날짜들이 정확히 렌더링되어야 한다', () => {
    render(
      <MonthView currentDate={currentDate} holidays={{}} filteredEvents={[]} notifiedEvents={[]} />
    );

    expect(screen.getByText('2025년 8월')).toBeInTheDocument();

    ['일', '월', '화', '수', '목', '금', '토'].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('지정된 날짜에 이벤트들이 정확히 표시되어야 한다', () => {
    render(
      <MonthView
        currentDate={currentDate}
        holidays={{}}
        filteredEvents={mockEvents}
        notifiedEvents={[]}
      />
    );

    const day22Cell = screen.getByText('22').closest('td');
    expect(within(day22Cell!).getByText('중요한 회의')).toBeInTheDocument();
    expect(within(day22Cell!).getByText('테스트 이벤트')).toBeInTheDocument();
  });

  it('지정된 날짜에 공휴일이 정확히 표시되어야 한다', () => {
    render(
      <MonthView
        currentDate={currentDate}
        holidays={mockHolidays}
        filteredEvents={[]}
        notifiedEvents={[]}
      />
    );

    const day15Cell = screen.getByText('15').closest('td');
    expect(within(day15Cell!).getByText('광복절')).toBeInTheDocument();
  });
});
