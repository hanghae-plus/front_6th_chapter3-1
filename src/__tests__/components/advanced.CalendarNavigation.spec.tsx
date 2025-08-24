import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { CalendarNavigation } from '../../components/CalendarNavigation';
import { CalendarViewType } from '../../types';

describe('CalendarNavigation', () => {
  const mockOnViewChange = vi.fn();
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 UI 렌더링', () => {
    test('네비게이션 버튼들과 뷰 선택기가 표시되어야 한다', () => {
      // Given & When: CalendarNavigation을 렌더링하면
      render(
        <CalendarNavigation
          view={CalendarViewType.WEEK}
          onViewChange={mockOnViewChange}
          onNavigate={mockOnNavigate}
        />
      );

      // Then: 이전/다음 버튼과 뷰 선택기가 표시되어야 한다
      expect(screen.getByLabelText('Previous')).toBeInTheDocument();
      expect(screen.getByLabelText('Next')).toBeInTheDocument();
      expect(screen.getByLabelText('뷰 타입 선택')).toBeInTheDocument();
    });
  });

  describe('현재 뷰 표시', () => {
    test('WEEK 뷰일 때 Week가 선택되어 표시되어야 한다', () => {
      // Given & When: WEEK 뷰로 렌더링하면
      render(
        <CalendarNavigation
          view={CalendarViewType.WEEK}
          onViewChange={mockOnViewChange}
          onNavigate={mockOnNavigate}
        />
      );

      // Then: Week 옵션이 선택되어 있어야 한다
      expect(screen.getByDisplayValue('week')).toBeInTheDocument();
    });

    test('MONTH 뷰일 때 Month가 선택되어 표시되어야 한다', () => {
      // Given & When: MONTH 뷰로 렌더링하면
      render(
        <CalendarNavigation
          view={CalendarViewType.MONTH}
          onViewChange={mockOnViewChange}
          onNavigate={mockOnNavigate}
        />
      );

      // Then: month 옵션이 선택되어 있어야 한다
      expect(screen.getByDisplayValue('month')).toBeInTheDocument();
    });
  });

  describe('네비게이션 액션', () => {
    test('이전 버튼 클릭 시 onNavigate가 prev로 호출되어야 한다', async () => {
      // Given: CalendarNavigation이 렌더링된 상태
      const user = userEvent.setup();
      render(
        <CalendarNavigation
          view={CalendarViewType.WEEK}
          onViewChange={mockOnViewChange}
          onNavigate={mockOnNavigate}
        />
      );

      // When: 이전 버튼을 클릭하면
      const prevButton = screen.getByLabelText('Previous');
      await user.click(prevButton);

      // Then: onNavigate가 'prev'로 호출되어야 한다
      expect(mockOnNavigate).toHaveBeenCalledWith('prev');
      expect(mockOnNavigate).toHaveBeenCalledTimes(1);
    });

    test('다음 버튼 클릭 시 onNavigate가 next로 호출되어야 한다', async () => {
      // Given: CalendarNavigation이 렌더링된 상태
      const user = userEvent.setup();
      render(
        <CalendarNavigation
          view={CalendarViewType.WEEK}
          onViewChange={mockOnViewChange}
          onNavigate={mockOnNavigate}
        />
      );

      // When: 다음 버튼을 클릭하면
      const nextButton = screen.getByLabelText('Next');
      await user.click(nextButton);

      // Then: onNavigate가 'next'로 호출되어야 한다
      expect(mockOnNavigate).toHaveBeenCalledWith('next');
      expect(mockOnNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('뷰 변경', () => {
    test('Month 선택 시 onViewChange가 MONTH로 호출되어야 한다', async () => {
      // Given: WEEK 상태로 렌더링된 CalendarNavigation
      const user = userEvent.setup();
      render(
        <CalendarNavigation
          view={CalendarViewType.WEEK}
          onViewChange={mockOnViewChange}
          onNavigate={mockOnNavigate}
        />
      );

      // When: Month 옵션을 선택하면
      const viewSelect = screen.getByRole('combobox');
      await user.click(viewSelect);
      await user.click(screen.getByText('Month'));

      // Then: onViewChange가 MONTH로 호출되어야 한다
      expect(mockOnViewChange).toHaveBeenCalledWith('month');
      expect(mockOnViewChange).toHaveBeenCalledTimes(1);
    });
  });
});
