import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { CalendarSection } from '../../components/CalendarSection';
import { createMockEvent } from '../utils';

// 자식 컴포넌트 mock
vi.mock('../../components/ViewSelector', () => ({
  ViewSelector: ({ view }: { view: string }) => (
    <div data-testid="view-selector">뷰 선택기: {view}</div>
  ),
}));

vi.mock('../../components/WeekView', () => ({
  WeekView: () => <div data-testid="week-view">주간 보기</div>,
}));

vi.mock('../../components/MonthView', () => ({
  MonthView: () => <div data-testid="month-view">월간 보기</div>,
}));

describe('CalendarSection: 캘린더 섹션', () => {
  const mockEvents = [createMockEvent(1), createMockEvent(2)];

  // 테스트에 필요한 기본 props
  const basicProps = {
    currentDate: new Date('2025-10-15'),
    filteredEvents: mockEvents,
    notifiedEvents: ['1'],
    holidays: { '2025-10-15': '한글날' },
    onViewChange: vi.fn(),
    onNavigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('일정 보기 제목이 표시되어야 한다', () => {
    render(<CalendarSection {...basicProps} view="week" />);

    // 제목이 화면에 나타나는지 확인
    expect(screen.getByText('일정 보기')).toBeInTheDocument();
  });

  it('ViewSelector가 항상 렌더링되어야 한다', () => {
    render(<CalendarSection {...basicProps} view="week" />);

    // ViewSelector가 화면에 나타나는지 확인
    expect(screen.getByTestId('view-selector')).toBeInTheDocument();
    expect(screen.getByText('뷰 선택기: week')).toBeInTheDocument();
  });

  it('week view일 때 WeekView만 렌더링되어야 한다', () => {
    render(<CalendarSection {...basicProps} view="week" />);

    // 주간 뷰 보이고 월간 뷰 안보이는지 확인
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
    expect(screen.queryByTestId('month-view')).not.toBeInTheDocument();
  });

  it('month view일 때 MonthView만 렌더링되어야 한다', () => {
    render(<CalendarSection {...basicProps} view="month" />);

    // 월간 뷰 보이고 주간 뷰 안보이는지 확인
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
    expect(screen.queryByTestId('week-view')).not.toBeInTheDocument();
  });
});
