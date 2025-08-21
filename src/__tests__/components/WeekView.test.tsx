import { render, screen, within } from '@testing-library/react';

import WeekView from '../../components/calendar/WeekView';
import { Event } from '../../types';

describe('WeekView Component', () => {
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

  it('현재 월, 요일, 날짜들이 정확히 렌더링되어야 한다', () => {
    render(<WeekView currentDate={currentDate} filteredEvents={[]} notifiedEvents={[]} />);

    ['일', '월', '화', '수', '목', '금', '토'].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });

    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('지정된 날짜에 이벤트들이 정확히 표시되어야 한다', () => {
    render(<WeekView currentDate={currentDate} filteredEvents={mockEvents} notifiedEvents={[]} />);

    const day22Cell = screen.getByText('22').closest('td');
    expect(within(day22Cell!).getByText('중요한 회의')).toBeInTheDocument();
    expect(within(day22Cell!).getByText('테스트 이벤트')).toBeInTheDocument();
  });
});
