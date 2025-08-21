import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { EventForm } from './EventForm';
import { Event } from '../../types';

// 하위 컴포넌트 Mock 처리 (UI 존재만 확인)
vi.mock('./BasicFields', () => ({
  BasicFields: () => <div data-testid="basic-fields" />,
}));
vi.mock('./TimeFields', () => ({
  TimeFields: () => <div data-testid="time-fields" />,
}));
vi.mock('./CategorySelect', () => ({
  CategorySelect: () => <div data-testid="category-select" />,
}));
vi.mock('./RepeatCheckbox', () => ({
  RepeatCheckbox: () => <div data-testid="repeat-checkbox" />,
}));
vi.mock('./NotificationSelect', () => ({
  NotificationSelect: () => <div data-testid="notification-select" />,
}));

describe('<EventForm />', () => {
  const baseProps = {
    title: '',
    setTitle: vi.fn(),
    date: '',
    setDate: vi.fn(),
    startTime: '',
    endTime: '',
    description: '',
    setDescription: vi.fn(),
    location: '',
    setLocation: vi.fn(),
    category: '',
    setCategory: vi.fn(),
    isRepeating: false,
    setIsRepeating: vi.fn(),
    notificationTime: 10,
    setNotificationTime: vi.fn(),
    startTimeError: null,
    endTimeError: null,
    editingEvent: null as Event | null,
    handleStartTimeChange: vi.fn(),
    handleEndTimeChange: vi.fn(),
    onTimeBlur: vi.fn(),
    onSubmit: vi.fn(),
  };

  it('editingEvent가 없으면 "일정 추가" 제목과 버튼이 표시된다', () => {
    render(<EventForm {...baseProps} editingEvent={null} />);

    expect(screen.getByRole('button', { name: '일정 추가' })).toBeInTheDocument();
    expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 추가');
  });

  it('editingEvent가 있으면 "일정 수정" 제목과 버튼이 표시된다', () => {
    const editingEvent: Event = { ...baseProps, id: '1' } as unknown as Event;

    render(<EventForm {...baseProps} editingEvent={editingEvent} />);

    expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();
    expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 수정');
  });

  it('모든 하위 컴포넌트가 렌더링된다', () => {
    render(<EventForm {...baseProps} />);

    expect(screen.getByTestId('basic-fields')).toBeInTheDocument();
    expect(screen.getByTestId('time-fields')).toBeInTheDocument();
    expect(screen.getByTestId('category-select')).toBeInTheDocument();
    expect(screen.getByTestId('repeat-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('notification-select')).toBeInTheDocument();
  });

  it('제출 버튼 클릭 시 onSubmit이 호출된다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<EventForm {...baseProps} onSubmit={onSubmit} />);

    await user.click(screen.getByTestId('event-submit-button'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
