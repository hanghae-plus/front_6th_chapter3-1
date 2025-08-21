import { render, screen } from '@testing-library/react';
import { EventFormPanel } from '../../components/EventFormPanel';
import { RepeatType } from '../../types';
import { createMockEvent } from '../utils';

describe('EventForm', () => {
  it('editingEvent가 null일 때, "일정 추가" 버튼이 표시된다.', () => {
    const mockProps = {
      editingEvent: null,
      eventForm: {
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
        location: '',
        category: '업무',
        isRepeating: false,
        repeatType: 'none' as RepeatType,
        repeatInterval: 1,
        repeatEndDate: '',
        notificationTime: 10,
      },
      setEventForm: vi.fn(),
      startTimeError: null,
      endTimeError: null,
      handleStartTimeChange: vi.fn(),
      handleEndTimeChange: vi.fn(),
      addOrUpdateEvent: vi.fn(),
    };

    render(<EventFormPanel {...mockProps} />);

    const addButton = screen.getByRole('button', { name: '일정 추가' });

    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveTextContent('일정 추가');
  });

  it('editingEvent가 있을 때, "일정 수정" 버튼이 표시된다.', () => {
    const event = createMockEvent(1);

    const mockProps = {
      editingEvent: event,
      eventForm: {
        title: event.title,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        description: event.description,
        location: event.location,
        category: event.category,
        isRepeating: event.repeat.type !== 'none',
        repeatType: event.repeat.type,
        repeatInterval: event.repeat.interval,
        repeatEndDate: event.repeat.endDate || '',
        notificationTime: event.notificationTime,
      },
      setEventForm: vi.fn(),
      startTimeError: null,
      endTimeError: null,
      handleStartTimeChange: vi.fn(),
      handleEndTimeChange: vi.fn(),
      addOrUpdateEvent: vi.fn(),
    };

    render(<EventFormPanel {...mockProps} />);

    const editButton = screen.getByRole('button', { name: '일정 수정' });

    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveTextContent('일정 수정');
  });

  it('일정 추가 모드에서 시작 시간이 종료 시간보다 늦을 때, 2개의 에러 툴팁이 표시된다.', () => {
    const mockProps = {
      editingEvent: null,
      eventForm: {
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
        location: '',
        category: '업무',
        isRepeating: false,
        repeatType: 'none' as RepeatType,
        repeatInterval: 1,
        repeatEndDate: '',
        notificationTime: 10,
      },
      setEventForm: vi.fn(),
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
      handleStartTimeChange: vi.fn(),
      handleEndTimeChange: vi.fn(),
      addOrUpdateEvent: vi.fn(),
    };

    render(<EventFormPanel {...mockProps} />);

    const tooltips = screen.getAllByRole('tooltip');

    expect(tooltips).toHaveLength(2);
    expect(screen.getByText('시작 시간은 종료 시간보다 빨라야 합니다.')).toBeInTheDocument();
    expect(screen.getByText('종료 시간은 시작 시간보다 늦어야 합니다.')).toBeInTheDocument();
  });

  it('일정 수정 모드에서 시작 시간이 종료 시간보다 늦을 때, 2개의 에러 툴팁이 표시된다.', () => {
    const event = createMockEvent(1);

    const mockProps = {
      editingEvent: event,
      eventForm: {
        title: event.title,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        description: event.description,
        location: event.location,
        category: event.category,
        isRepeating: event.repeat.type !== 'none',
        repeatType: event.repeat.type,
        repeatInterval: event.repeat.interval,
        repeatEndDate: event.repeat.endDate || '',
        notificationTime: event.notificationTime,
      },
      setEventForm: vi.fn(),
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
      handleStartTimeChange: vi.fn(),
      handleEndTimeChange: vi.fn(),
      addOrUpdateEvent: vi.fn(),
    };

    render(<EventFormPanel {...mockProps} />);

    const tooltips = screen.getAllByRole('tooltip');

    expect(tooltips).toHaveLength(2);
    expect(screen.getByText('시작 시간은 종료 시간보다 빨라야 합니다.')).toBeInTheDocument();
    expect(screen.getByText('종료 시간은 시작 시간보다 늦어야 합니다.')).toBeInTheDocument();
  });
});
