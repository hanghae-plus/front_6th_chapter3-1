import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CalendarContainer } from '../../components/CalendarContainer';
import type { Event } from '../../types';

describe('CalendarContainer', () => {
  const mockOnNavigate = vi.fn();
  const mockOnViewChange = vi.fn();

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

  const defaultProps = {
    view: 'month' as const,
    currentDate: new Date('2025-08-20'),
    holidays: { '2025-08-15': '광복절' },
    events: mockEvents,
    notifiedEvents: ['1'],
    onNavigate: mockOnNavigate,
    onViewChange: mockOnViewChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('컨테이너가 정확히 렌더링된다', () => {
    render(<CalendarContainer {...defaultProps} />);

    expect(screen.getByText('일정 보기')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument(); // Current selected value
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('CalendarNavigation 컴포넌트가 렌더링된다', () => {
    render(<CalendarContainer {...defaultProps} />);

    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
  });

  it('CalendarGrid 컴포넌트가 렌더링된다', () => {
    render(<CalendarContainer {...defaultProps} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('이전 버튼 클릭 시 onNavigate가 호출된다', async () => {
    const user = userEvent.setup();
    render(<CalendarContainer {...defaultProps} />);

    const prevButton = screen.getByLabelText('Previous');
    await user.click(prevButton);

    expect(mockOnNavigate).toHaveBeenCalledWith('prev');
  });

  it('다음 버튼 클릭 시 onNavigate가 호출된다', async () => {
    const user = userEvent.setup();
    render(<CalendarContainer {...defaultProps} />);

    const nextButton = screen.getByLabelText('Next');
    await user.click(nextButton);

    expect(mockOnNavigate).toHaveBeenCalledWith('next');
  });

  it('월간 버튼 클릭 시 onViewChange가 호출된다', async () => {
    const user = userEvent.setup();
    render(<CalendarContainer {...defaultProps} view="week" />);

    const select = screen.getByRole('combobox');
    await user.click(select);

    const monthOption = await screen.findByText('Month');
    await user.click(monthOption);

    expect(mockOnViewChange).toHaveBeenCalledWith('month');
  });

  it('주간 버튼 클릭 시 onViewChange가 호출된다', async () => {
    const user = userEvent.setup();
    render(<CalendarContainer {...defaultProps} />);

    const select = screen.getByRole('combobox');
    await user.click(select);

    const weekOption = await screen.findByText('Week');
    await user.click(weekOption);

    expect(mockOnViewChange).toHaveBeenCalledWith('week');
  });

  it('이벤트들이 달력에 표시된다', () => {
    render(<CalendarContainer {...defaultProps} />);

    expect(screen.getByText('팀 회의')).toBeInTheDocument();
    expect(screen.getByText('프로젝트 회의')).toBeInTheDocument();
  });

  it('휴일이 달력에 표시된다', () => {
    render(<CalendarContainer {...defaultProps} />);

    expect(screen.getByText('광복절')).toBeInTheDocument();
  });

  it('주간 뷰에서도 정확히 렌더링된다', () => {
    render(<CalendarContainer {...defaultProps} view="week" />);

    expect(screen.getByText('일정 보기')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
