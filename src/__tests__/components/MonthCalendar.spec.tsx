import { render, screen } from '@testing-library/react';

import { MonthCalendar } from '../../components/MonthCalendar';
import { createMockEvent } from '../utils';

describe('MonthCalendar', () => {
  it('2025년 10월은 35개의 테이블 셀과 31개의 일 수가 표시된다.', () => {
    const mockProps = {
      currentDate: new Date('2025-10-15'),
      filteredEvents: [],
      notifiedEvents: [],
      holidays: {},
    };

    render(<MonthCalendar {...mockProps} />);

    expect(screen.getAllByRole('cell')).toHaveLength(35);

    for (let i = 1; i <= 31; i++) {
      expect(screen.getByText(i)).toBeInTheDocument();
    }
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
      holidays: {},
    };

    render(<MonthCalendar {...mockProps} />);

    expect(screen.getByText('기존 회의')).toBeInTheDocument();
    expect(screen.getByText('점심 식사')).toBeInTheDocument();
  });

  it('개천절, 추석, 한글날 등 공휴일은 빨간색 텍스트로 표시된다.', () => {
    const mockProps = {
      currentDate: new Date('2025-10-15'),
      filteredEvents: [],
      notifiedEvents: [],
      holidays: {
        '2025-10-03': '개천절',
        '2025-10-05': '추석',
        '2025-10-06': '추석',
        '2025-10-07': '추석',
        '2025-10-09': '한글날',
      },
    };

    render(<MonthCalendar {...mockProps} />);

    expect(screen.getByText('개천절')).toBeInTheDocument();
    expect(screen.getByText('한글날')).toBeInTheDocument();
    expect(screen.getAllByText('추석')).toHaveLength(3);

    expect(screen.getByText('개천절')).toHaveStyle({
      color: '#d32f2f',
    });

    expect(screen.getByText('한글날')).toHaveStyle({
      color: '#d32f2f',
    });

    screen.getAllByText('추석').forEach((item) => {
      expect(item).toHaveStyle({
        color: '#d32f2f',
      });
    });
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
      holidays: {},
    };

    render(<MonthCalendar {...mockProps} />);

    expect(screen.getByTestId('NotificationsIcon')).toBeInTheDocument();
    expect(screen.getByText('점심 미팅')).toHaveStyle({
      color: '#d32f2f',
    });
  });
});
