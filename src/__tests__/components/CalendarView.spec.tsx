import { screen } from '@testing-library/react';

import { CalendarView } from '../../components/CalendarView';
import { Event } from '../../types';
import { renderWithProvider } from '../renderProvider';
import { createTestEvent } from '../utils';

describe('CalendarView 컴포넌트', () => {
  const mockEvents: Event[] = [
    createTestEvent({
      id: '1',
      title: '주간 회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
    }),
    createTestEvent({
      id: '2',
      title: '프로젝트 미팅',
      date: '2025-01-16',
      startTime: '14:00',
      endTime: '15:00',
    }),
  ];

  const mockHolidays = {
    '2025-01-01': '신정',
    '2025-01-15': '임시공휴일',
  };

  const defaultProps = {
    currentDate: new Date('2025-01-15'),
    holidays: mockHolidays,
    filteredEvents: mockEvents,
    notifiedEvents: ['1'],
  };

  describe('주간 뷰 렌더링', () => {
    it('주간 뷰가 올바르게 렌더링되고 주간 제목이 표시된다', () => {
      renderWithProvider(<CalendarView {...defaultProps} view="week" />);

      expect(screen.getByTestId('week-view')).toBeInTheDocument();
      expect(screen.getByText('2025년 1월 3주')).toBeInTheDocument();
      expect(screen.getByText('일')).toBeInTheDocument();
      expect(screen.getByText('월')).toBeInTheDocument();
      expect(screen.getByText('화')).toBeInTheDocument();
      expect(screen.getByText('수')).toBeInTheDocument();
      expect(screen.getByText('목')).toBeInTheDocument();
      expect(screen.getByText('금')).toBeInTheDocument();
      expect(screen.getByText('토')).toBeInTheDocument();
    });

    it('주간 뷰에서 해당 주의 이벤트들이 올바르게 표시된다', () => {
      renderWithProvider(<CalendarView {...defaultProps} view="week" />);

      // 이벤트 제목 확인
      expect(screen.getByText('주간 회의')).toBeInTheDocument();
      expect(screen.getByText('프로젝트 미팅')).toBeInTheDocument();
    });

    it('주간 뷰에서 알림 이벤트에 알림 아이콘이 표시된다', () => {
      renderWithProvider(<CalendarView {...defaultProps} view="week" />);

      const notificationIcons = screen.getAllByTestId('NotificationsIcon');
      expect(notificationIcons.length).toBeGreaterThan(0);
    });
  });

  describe('월간 뷰 렌더링', () => {
    it('월간 뷰가 올바르게 렌더링되고 월간 제목이 표시된다', () => {
      renderWithProvider(<CalendarView {...defaultProps} view="month" />);

      expect(screen.getByTestId('month-view')).toBeInTheDocument();
      expect(screen.getByText('2025년 1월')).toBeInTheDocument();
    });

    it('월간 뷰에서 공휴일이 올바르게 표시된다', () => {
      renderWithProvider(<CalendarView {...defaultProps} view="month" />);

      expect(screen.getByText('신정')).toBeInTheDocument();
      expect(screen.getByText('임시공휴일')).toBeInTheDocument();
    });

    it('월간 뷰에서 이벤트들이 올바르게 표시된다', () => {
      renderWithProvider(<CalendarView {...defaultProps} view="month" />);

      expect(screen.getByText('주간 회의')).toBeInTheDocument();
      expect(screen.getByText('프로젝트 미팅')).toBeInTheDocument();
    });
  });
});
