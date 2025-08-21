import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CalendarNavigation } from '../../components/CalendarNavigation';

describe('CalendarNavigation', () => {
  const mockOnNavigate = vi.fn();
  const mockOnViewChange = vi.fn();

  const defaultProps = {
    currentDate: new Date('2025-10-15'),
    view: 'month' as const,
    onNavigate: mockOnNavigate,
    onViewChange: mockOnViewChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('네비게이션 컴포넌트가 정확히 렌더링된다', () => {
    render(<CalendarNavigation {...defaultProps} />);

    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
    expect(screen.getByLabelText('뷰 타입 선택')).toBeInTheDocument();
  });

  it('이전 버튼 클릭 시 onNavigate가 prev 인자로 호출된다', async () => {
    const user = userEvent.setup();
    render(<CalendarNavigation {...defaultProps} />);

    const button = screen.getByLabelText('Previous');
    await user.click(button);

    expect(mockOnNavigate).toHaveBeenCalledWith('prev');
  });

  it('다음 버튼 클릭 시 onNavigate가 next 인자로 호출된다', async () => {
    const user = userEvent.setup();
    render(<CalendarNavigation {...defaultProps} />);

    const button = screen.getByLabelText('Next');
    await user.click(button);

    expect(mockOnNavigate).toHaveBeenCalledWith('next');
  });

  it('뷰 타입 선택에서 현재 뷰가 정확히 표시된다', () => {
    render(<CalendarNavigation {...defaultProps} />);

    const select = screen.getByText('Month');
    expect(select).toBeInTheDocument();
  });

  it('주별 뷰 선택 시 onViewChange가 week 인자로 호출된다', async () => {
    const user = userEvent.setup();
    render(<CalendarNavigation {...defaultProps} />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    const weekOption = await screen.findByText('Week');
    await user.click(weekOption);

    expect(mockOnViewChange).toHaveBeenCalledWith('week');
  });

  it('월별 뷰 선택 시 onViewChange가 month 인자로 호출된다', async () => {
    const user = userEvent.setup();
    render(<CalendarNavigation {...defaultProps} view="week" />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    const monthOption = await screen.findByText('Month');
    await user.click(monthOption);

    expect(mockOnViewChange).toHaveBeenCalledWith('month');
  });

  it('주별 뷰로 설정되어 있을 때 select 값이 week로 표시된다', () => {
    render(<CalendarNavigation {...defaultProps} view="week" />);

    const select = screen.getByText('Week');
    expect(select).toBeInTheDocument();
  });
});
