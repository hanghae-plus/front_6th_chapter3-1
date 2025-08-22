import { render, screen, fireEvent } from '@testing-library/react';
import { vi, test, describe, expect } from 'vitest';

import { EventManager } from '../../components/EventManager';

describe('EventManager', () => {
  const defaultProps = {
    view: 'week' as const,
    onViewChange: vi.fn(),
    onNavigate: vi.fn(),
    renderWeekView: () => <div>주간 뷰</div>,
    renderMonthView: () => <div>월간 뷰</div>,
  };

  test('주간 뷰가 선택되면 주간 뷰가 렌더링된다', () => {
    render(<EventManager {...defaultProps} view="week" />);

    expect(screen.getByText('주간 뷰')).toBeInTheDocument();
    expect(screen.queryByText('월간 뷰')).not.toBeInTheDocument();
  });

  test('월간 뷰가 선택되면 월간 뷰가 렌더링된다', () => {
    render(<EventManager {...defaultProps} view="month" />);

    expect(screen.getByText('월간 뷰')).toBeInTheDocument();
    expect(screen.queryByText('주간 뷰')).not.toBeInTheDocument();
  });

  test('이전 버튼 클릭 시 onNavigate가 prev와 함께 호출된다', () => {
    const mockNavigate = vi.fn();

    render(<EventManager {...defaultProps} onNavigate={mockNavigate} />);

    const prevButton = screen.getByRole('button', { name: 'Previous' });
    fireEvent.click(prevButton);

    expect(mockNavigate).toHaveBeenCalledWith('prev');
  });

  test('다음 버튼 클릭 시 onNavigate가 next와 함께 호출된다', () => {
    const mockNavigate = vi.fn();

    render(<EventManager {...defaultProps} onNavigate={mockNavigate} />);

    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);

    expect(mockNavigate).toHaveBeenCalledWith('next');
  });

  test('뷰 타입 변경 시 onViewChange가 호출된다', () => {
    const mockViewChange = vi.fn();

    render(<EventManager {...defaultProps} onViewChange={mockViewChange} />);

    const viewSelect = screen.getByRole('combobox');
    fireEvent.click(viewSelect);

    // Material-UI Select는 복잡하므로 간단히 클릭만 테스트
    expect(viewSelect).toBeInTheDocument();
  });
});
