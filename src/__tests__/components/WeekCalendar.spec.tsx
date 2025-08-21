import { render, screen } from '@testing-library/react';
import { WeekCalendar } from '../../components/WeekCalendar';
import { createMockEvent } from '../utils';

describe('WeekCalendar', () => {
  it('2025년 10월 15일(수요일)을 기준으로 해당 주의 날짜들(12-18일)이 표시된다', () => {
    const mockProps = {
      currentDate: new Date('2025-10-15'),
      filteredEvents: [],
      notifiedEvents: [],
    };

    render(<WeekCalendar {...mockProps} />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('일정이 있는 날짜에는 일정 title이 표시된다.', () => {
    const mockProps = {
      currentDate: new Date('2025-10-15'),
      filteredEvents: [
        createMockEvent(1),
        createMockEvent(2, {
          title: '점심 식사',
          date: '2025-10-16',
          startTime: '10:00',
          endTime: '11:00',
        }),
      ],
      notifiedEvents: [],
    };

    render(<WeekCalendar {...mockProps} />);

    expect(screen.getByText('기존 회의')).toBeInTheDocument();
    expect(screen.getByText('점심 식사')).toBeInTheDocument();
  });

  it('일정이 없는 날짜에는 일정이 표시되지 않는다.', () => {
    const mockProps = {
      currentDate: new Date('2025-09-15'),
      filteredEvents: [createMockEvent(1)],
      notifiedEvents: [],
    };

    render(<WeekCalendar {...mockProps} />);

    expect(screen.queryByText('기존 회의')).not.toBeInTheDocument();
  });

  it('notifiedEvents에 포함된 알림 이벤트들은 종 아이콘과 함께 빨간색으로 표시된다.', async () => {
    const mockProps = {
      currentDate: new Date('2025-10-15'),
      filteredEvents: [
        createMockEvent(1, {
          notificationTime: 1,
          title: '점심 미팅',
          date: '2025-10-15',
          startTime: '14:30',
          endTime: '15:30',
        }),
      ],
      notifiedEvents: ['1'],
    };

    render(<WeekCalendar {...mockProps} />);

    expect(screen.getByTestId('NotificationsIcon')).toBeInTheDocument();
    expect(screen.getByText('점심 미팅')).toHaveStyle({
      color: '#d32f2f',
    });
  });
});
