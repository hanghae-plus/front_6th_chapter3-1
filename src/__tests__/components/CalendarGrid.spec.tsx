import { render, screen } from '@testing-library/react';

import { CalendarGrid } from '../../components/CalendarGrid';
import type { Event } from '../../types';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-08-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '2',
    title: '프로젝트 회의',
    date: '2025-08-20',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 프로젝트 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '점심 팀회식',
    date: '2025-08-24',
    startTime: '12:00',
    endTime: '13:00',
    description: '분기 팀 회식',
    location: '강동화로',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('CalendarGrid', () => {
  const defaultProps = {
    events: mockEvents,
    currentDate: new Date('2025-08-20'),
    view: 'month' as const,
    holidays: { '2025-08-01': '신정' },
    notifiedEvents: ['1'],
  };

  it('월별 뷰에서 달력 그리드가 정확히 렌더링된다', () => {
    render(<CalendarGrid {...defaultProps} />);

    expect(screen.getByTestId('month-view')).toBeInTheDocument();
    expect(screen.getByText('2025년 8월')).toBeInTheDocument();
    expect(screen.getByText('팀 회의')).toBeInTheDocument();
  });

  it('주별 뷰에서 달력 그리드가 정확히 렌더링된다', () => {
    render(<CalendarGrid {...defaultProps} view="week" />);

    expect(screen.getByTestId('week-view')).toBeInTheDocument();
    expect(screen.getByText('팀 회의')).toBeInTheDocument();
  });

  it('알림이 설정된 이벤트에 알림 아이콘과 스타일이 적용된다', () => {
    render(<CalendarGrid {...defaultProps} />);

    const eventBox = screen.getByText('팀 회의').closest('[class*="MuiBox"]');
    expect(eventBox).toHaveStyle('background-color: #ffebee');
    expect(eventBox).toHaveStyle('color: #d32f2f');
    expect(eventBox).toHaveStyle('font-weight: 700');
  });

  it('알림이 설정되지 않은 이벤트는 기본 스타일이 적용된다', () => {
    render(<CalendarGrid {...defaultProps} />);

    const eventBox = screen.getByText('프로젝트 회의').closest('[class*="MuiBox"]');
    expect(eventBox).toHaveStyle('background-color: #f5f5f5');
    expect(eventBox).toHaveStyle('font-weight: normal');
  });

  it('공휴일이 정확히 표시된다', () => {
    const propsWithHoliday = {
      ...defaultProps,
      currentDate: new Date('2025-08-01'),
      holidays: { '2025-08-01': '신정' },
    };

    render(<CalendarGrid {...propsWithHoliday} />);

    expect(screen.getByText('신정')).toBeInTheDocument();
  });

  it('이벤트가 없는 날짜에는 이벤트가 표시되지 않는다', () => {
    const propsWithoutEvents = {
      ...defaultProps,
      events: [],
    };

    render(<CalendarGrid {...propsWithoutEvents} />);

    expect(screen.queryByText('팀 회의')).not.toBeInTheDocument();
    expect(screen.queryByText('프로젝트 회의')).not.toBeInTheDocument();
  });
});
