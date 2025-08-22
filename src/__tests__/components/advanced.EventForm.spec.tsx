import { render, screen, fireEvent } from '@testing-library/react';
import { vi, test, describe, beforeEach, expect } from 'vitest';

import { EventForm } from '../../components/EventForm';

describe('EventForm', () => {
  const defaultProps = {
    title: '테스트 제목',
    date: '2025-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '테스트 위치',
    category: '업무',
    isRepeating: false,
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: null,
    notificationTime: 10,
    startTimeError: null,
    endTimeError: null,
    editingEvent: null,
    onTitleChange: vi.fn(),
    onDateChange: vi.fn(),
    onStartTimeChange: vi.fn(),
    onEndTimeChange: vi.fn(),
    onDescriptionChange: vi.fn(),
    onLocationChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onIsRepeatingChange: vi.fn(),
    onNotificationTimeChange: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('컴포넌트가 렌더링된다', () => {
    render(<EventForm {...defaultProps} />);

    expect(screen.getByDisplayValue('테스트 제목')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
  });

  test('제목 변경 시 onTitleChange가 호출된다', () => {
    render(<EventForm {...defaultProps} />);

    const titleInput = screen.getByDisplayValue('테스트 제목');
    fireEvent.change(titleInput, { target: { value: '새로운 제목' } });

    expect(defaultProps.onTitleChange).toHaveBeenCalledWith('새로운 제목');
  });

  test('날짜 변경 시 onDateChange가 호출된다', () => {
    render(<EventForm {...defaultProps} />);

    const dateInput = screen.getByDisplayValue('2025-01-01');
    fireEvent.change(dateInput, { target: { value: '2025-12-31' } });

    expect(defaultProps.onDateChange).toHaveBeenCalledWith('2025-12-31');
  });

  test('시간 변경 시 핸들러가 호출된다', () => {
    render(<EventForm {...defaultProps} />);

    const startTimeInput = screen.getByDisplayValue('09:00');
    fireEvent.change(startTimeInput, { target: { value: '10:00' } });

    expect(defaultProps.onStartTimeChange).toHaveBeenCalledWith('10:00');
  });

  test('제출 버튼 클릭 시 onSubmit이 호출된다', () => {
    render(<EventForm {...defaultProps} />);

    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  test('일정 수정 모드에서 올바른 제목이 표시된다', () => {
    const editingEvent = {
      id: '1',
      title: '기존 일정',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0, endDate: undefined },
      notificationTime: 10,
    };

    render(<EventForm {...defaultProps} editingEvent={editingEvent} />);

    expect(screen.getByRole('heading', { name: '일정 수정' })).toBeInTheDocument();
  });

  test('일정 추가 모드에서 올바른 제목이 표시된다', () => {
    render(<EventForm {...defaultProps} editingEvent={null} />);

    expect(screen.getByRole('heading', { name: '일정 추가' })).toBeInTheDocument();
  });
});
