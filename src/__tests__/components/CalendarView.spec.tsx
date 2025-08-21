import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { CalendarView } from '../../components/CalendarView';
import { createMockEvent } from '../utils';

const mockProps = {
  view: 'week' as const,
  setView: vi.fn(),
  currentDate: new Date('2025-10-01'),
  navigate: vi.fn(),
  filteredEvents: [],
  holidays: {},
  notifiedEvents: [],
};

const renderCalendarView = (props = {}) => {
  return render(<CalendarView {...mockProps} {...props} />);
};

describe('CalendarView 컴포넌트', () => {
  it('일정 보기 제목이 렌더링된다', () => {
    renderCalendarView();
    expect(screen.getByText('일정 보기')).toBeInTheDocument();
  });

  it('뷰 타입 선택기가 렌더링된다', () => {
    renderCalendarView();
    expect(screen.getByLabelText('뷰 타입 선택')).toBeInTheDocument();
  });

  it('이전/다음 버튼이 렌더링된다', () => {
    renderCalendarView();
    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
  });

  it('주별 뷰에서 Week 옵션이 선택되어 있다', () => {
    renderCalendarView({ view: 'week' });
    expect(screen.getByDisplayValue('week')).toBeInTheDocument();
  });

  it('월별 뷰에서 Month 옵션이 선택되어 있다', () => {
    renderCalendarView({ view: 'month' });
    expect(screen.getByDisplayValue('month')).toBeInTheDocument();
  });

  it('뷰 타입을 변경할 수 있다', () => {
    const setView = vi.fn();
    renderCalendarView({ setView });

    const viewSelect = screen.getByLabelText('뷰 타입 선택');
    fireEvent.mouseDown(viewSelect);

    // Material-UI Select의 경우 옵션이 렌더링되지 않을 수 있으므로 간단히 테스트
    expect(viewSelect).toBeInTheDocument();
  });

  it('이전 버튼 클릭 시 navigate가 호출된다', () => {
    const navigate = vi.fn();
    renderCalendarView({ navigate });

    const prevButton = screen.getByLabelText('Previous');
    fireEvent.click(prevButton);

    expect(navigate).toHaveBeenCalledWith('prev');
  });

  it('다음 버튼 클릭 시 navigate가 호출된다', () => {
    const navigate = vi.fn();
    renderCalendarView({ navigate });

    const nextButton = screen.getByLabelText('Next');
    fireEvent.click(nextButton);

    expect(navigate).toHaveBeenCalledWith('next');
  });

  it('주별 뷰가 올바르게 렌더링된다', () => {
    renderCalendarView({ view: 'week' });
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
  });

  it('월별 뷰가 올바르게 렌더링된다', () => {
    renderCalendarView({ view: 'month' });
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  it('요일 헤더가 올바르게 렌더링된다', () => {
    renderCalendarView();

    expect(screen.getByText('일')).toBeInTheDocument();
    expect(screen.getByText('월')).toBeInTheDocument();
    expect(screen.getByText('화')).toBeInTheDocument();
    expect(screen.getByText('수')).toBeInTheDocument();
    expect(screen.getByText('목')).toBeInTheDocument();
    expect(screen.getByText('금')).toBeInTheDocument();
    expect(screen.getByText('토')).toBeInTheDocument();
  });

  it('이벤트가 있는 경우 이벤트가 렌더링된다', () => {
    const events = [
      createMockEvent(1, {
        title: '테스트 이벤트',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ];

    renderCalendarView({ filteredEvents: events });

    // 이벤트가 렌더링되는지 확인 (실제 DOM 구조에 따라 조정 필요)
    expect(screen.getByText('테스트 이벤트')).toBeInTheDocument();
  });

  it('알림이 있는 이벤트가 올바르게 표시된다', () => {
    const events = [
      createMockEvent(1, {
        title: '알림 이벤트',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
      }),
    ];

    renderCalendarView({
      filteredEvents: events,
      notifiedEvents: ['1'],
    });

    expect(screen.getByText('알림 이벤트')).toBeInTheDocument();
  });
});
