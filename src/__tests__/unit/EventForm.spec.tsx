import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import EventForm from '../../components/EventForm';
import { Event } from '../../types';

describe('EventForm', () => {
  const mockProps = {
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
    category: '업무',
    setCategory: vi.fn(),
    isRepeating: false,
    setIsRepeating: vi.fn(),
    notificationTime: 10,
    setNotificationTime: vi.fn(),
    startTimeError: null,
    endTimeError: null,
    editingEvent: null,
    handleStartTimeChange: vi.fn(),
    handleEndTimeChange: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('새 일정 추가 모드에서 올바른 제목이 표시된다', () => {
    render(<EventForm {...mockProps} />);

    expect(screen.getByRole('heading', { name: '일정 추가' })).toBeInTheDocument();
  });

  it('일정 수정 모드에서 올바른 제목이 표시된다', () => {
    const editingEvent: Event = {
      id: 'test-id',
      title: '기존 일정',
      date: '2025-08-21',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    render(<EventForm {...mockProps} editingEvent={editingEvent} />);

    expect(screen.getByRole('heading', { name: '일정 수정' })).toBeInTheDocument();
  });

  it('제목 입력 시 setTitle이 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...mockProps} />);

    const titleInput = screen.getByLabelText('제목');
    await user.type(titleInput, '회의');

    expect(mockProps.setTitle).toHaveBeenCalled();
  });

  it('날짜 입력 시 setDate가 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...mockProps} />);

    const dateInput = screen.getByLabelText('날짜');
    await user.type(dateInput, '2025-08-21');

    expect(mockProps.setDate).toHaveBeenCalled();
  });

  it('시작 시간 변경 시 handleStartTimeChange가 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...mockProps} />);

    const startTimeInput = screen.getByLabelText('시작 시간');
    await user.type(startTimeInput, '14:30');

    expect(mockProps.handleStartTimeChange).toHaveBeenCalled();
  });

  it('종료 시간 변경 시 handleEndTimeChange가 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...mockProps} />);

    const endTimeInput = screen.getByLabelText('종료 시간');
    await user.type(endTimeInput, '15:30');

    expect(mockProps.handleEndTimeChange).toHaveBeenCalled();
  });

  it('설명 입력 시 setDescription이 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...mockProps} />);

    const descriptionInput = screen.getByLabelText('설명');
    await user.type(descriptionInput, '회의');

    expect(mockProps.setDescription).toHaveBeenCalled();
  });

  it('위치 입력 시 setLocation이 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...mockProps} />);

    const locationInput = screen.getByLabelText('위치');
    await user.type(locationInput, '회의실');

    expect(mockProps.setLocation).toHaveBeenCalled();
  });

  it('카테고리 Select 컴포넌트가 렌더링된다', () => {
    render(<EventForm {...mockProps} />);

    const categorySelect = screen.getByDisplayValue('업무');
    expect(categorySelect).toBeInTheDocument();
  });

  it('반복 일정 체크박스 변경 시 setIsRepeating이 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...mockProps} />);

    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    expect(mockProps.setIsRepeating).toHaveBeenCalledWith(true);
  });

  it('시작 시간 에러가 있을 때 에러 상태가 표시된다', () => {
    const propsWithError = {
      ...mockProps,
      startTimeError: '시간을 확인해주세요',
    };

    render(<EventForm {...propsWithError} />);

    const startTimeInput = screen.getByLabelText('시작 시간');
    expect(startTimeInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('종료 시간 에러가 있을 때 에러 상태가 표시된다', () => {
    const propsWithError = {
      ...mockProps,
      endTimeError: '시간을 확인해주세요',
    };

    render(<EventForm {...propsWithError} />);

    const endTimeInput = screen.getByLabelText('종료 시간');
    expect(endTimeInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('폼 제출 버튼 클릭 시 onSubmit이 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...mockProps} />);

    const submitButton = screen.getByTestId('event-submit-button');
    await user.click(submitButton);

    expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
  });
});
