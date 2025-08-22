import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { EventForm } from '../../components/EventForm';
import type { Event } from '../../types';

describe('EventForm', () => {
  const mockSetTitle = vi.fn();
  const mockSetDate = vi.fn();
  const mockSetDescription = vi.fn();
  const mockSetLocation = vi.fn();
  const mockSetCategory = vi.fn();
  const mockSetIsRepeating = vi.fn();
  const mockSetNotificationTime = vi.fn();
  const mockHandleStartTimeChange = vi.fn();
  const mockHandleEndTimeChange = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    title: '',
    setTitle: mockSetTitle,
    date: '',
    setDate: mockSetDate,
    startTime: '',
    endTime: '',
    description: '',
    setDescription: mockSetDescription,
    location: '',
    setLocation: mockSetLocation,
    category: '업무',
    setCategory: mockSetCategory,
    isRepeating: false,
    setIsRepeating: mockSetIsRepeating,
    notificationTime: 10,
    setNotificationTime: mockSetNotificationTime,
    startTimeError: null,
    endTimeError: null,
    handleStartTimeChange: mockHandleStartTimeChange,
    handleEndTimeChange: mockHandleEndTimeChange,
    editingEvent: null,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('새 일정 추가 모드에서 폼이 정확히 렌더링된다', () => {
    render(<EventForm {...defaultProps} />);

    expect(screen.getAllByText('일정 추가')[0]).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('날짜')).toBeInTheDocument();
    expect(screen.getByLabelText('시작 시간')).toBeInTheDocument();
    expect(screen.getByLabelText('종료 시간')).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByLabelText('위치')).toBeInTheDocument();
    expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 일정')).toBeInTheDocument();
    expect(screen.getByText('알림 설정')).toBeInTheDocument();
    expect(screen.getByTestId('event-submit-button')).toBeInTheDocument();
  });

  it('일정 수정 모드에서 제목이 변경되어 표시된다', () => {
    const editingEvent: Event = {
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
    };

    render(<EventForm {...defaultProps} editingEvent={editingEvent} />);

    expect(screen.getAllByText('일정 수정')[0]).toBeInTheDocument();
  });

  it('제목 입력 시 setTitle이 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...defaultProps} />);

    const input = screen.getByLabelText('제목');
    await user.clear(input);
    await user.type(input, '테스트');

    expect(mockSetTitle).toHaveBeenCalledTimes(3);
  });

  it('날짜 입력 시 setDate가 올바른 값으로 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...defaultProps} />);

    const input = screen.getByLabelText('날짜');
    await user.type(input, '2025-10-15');

    expect(mockSetDate).toHaveBeenCalledWith('2025-10-15');
  });

  it('설명 입력 시 setDescription이 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...defaultProps} />);

    const input = screen.getByLabelText('설명');
    await user.clear(input);
    await user.type(input, '테스트');

    expect(mockSetDescription).toHaveBeenCalledTimes(3);
  });

  it('위치 입력 시 setLocation이 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...defaultProps} />);

    const input = screen.getByLabelText('위치');
    await user.clear(input);
    await user.type(input, '테스트');

    expect(mockSetLocation).toHaveBeenCalledTimes(3);
  });

  it('카테고리 선택 시 setCategory가 올바른 값으로 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...defaultProps} />);

    const selects = screen.getAllByRole('combobox');
    const select = selects[0];
    await user.click(select);

    const option = await screen.findByText('개인');
    await user.click(option);

    expect(mockSetCategory).toHaveBeenCalledWith('개인');
  });

  it('반복 일정 체크박스 클릭 시 setIsRepeating이 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...defaultProps} />);

    const checkbox = screen.getByLabelText('반복 일정');
    await user.click(checkbox);

    expect(mockSetIsRepeating).toHaveBeenCalledWith(true);
  });

  it('알림 설정 변경 시 setNotificationTime이 올바른 값으로 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...defaultProps} />);

    const selects = screen.getAllByRole('combobox');
    const select = selects[1];
    await user.click(select);

    const option = await screen.findByText('1시간 전');
    await user.click(option);

    expect(mockSetNotificationTime).toHaveBeenCalledWith(60);
  });

  it('시작 시간 변경 시 handleStartTimeChange가 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...defaultProps} />);

    const startTimeInput = screen.getByLabelText('시작 시간');
    await user.type(startTimeInput, '10:00');

    expect(mockHandleStartTimeChange).toHaveBeenCalled();
  });

  it('종료 시간 변경 시 handleEndTimeChange가 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...defaultProps} />);

    const endTimeInput = screen.getByLabelText('종료 시간');
    await user.type(endTimeInput, '11:00');

    expect(mockHandleEndTimeChange).toHaveBeenCalled();
  });

  it('시간 에러가 있을 때 툴팁이 표시된다', () => {
    const propsWithError = {
      ...defaultProps,
      startTimeError: '시작 시간 오류',
      endTimeError: '종료 시간 오류',
    };

    render(<EventForm {...propsWithError} />);

    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');

    expect(startTimeInput).toHaveAttribute('aria-invalid', 'true');
    expect(endTimeInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('제출 버튼 클릭 시 onSubmit이 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventForm {...defaultProps} />);

    const button = screen.getByTestId('event-submit-button');
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
