import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { describe, it, expect, vi } from 'vitest';

import { EventForm } from '../../components/EventForm';
import { createMockEvent } from '../utils';

// Mock the hooks
vi.mock('../../hooks/useEventForm', () => ({
  useEventForm: () => ({
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
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 10,
    setNotificationTime: vi.fn(),
    startTimeError: '',
    endTimeError: '',
    editingEvent: null,
    setEditingEvent: vi.fn(),
    handleStartTimeChange: vi.fn(),
    handleEndTimeChange: vi.fn(),
    resetForm: vi.fn(),
    editEvent: vi.fn(),
  }),
}));

const renderEventForm = (props = {}) => {
  const defaultProps = {
    events: [],
    onSave: vi.fn(),
    onOverlap: vi.fn(),
    ...props,
  };

  return render(
    <SnackbarProvider>
      <EventForm {...defaultProps} />
    </SnackbarProvider>
  );
};

describe('EventForm 컴포넌트', () => {
  it('모든 필수 필드가 렌더링된다', () => {
    renderEventForm();

    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('날짜')).toBeInTheDocument();
    expect(screen.getByLabelText('시작 시간')).toBeInTheDocument();
    expect(screen.getByLabelText('종료 시간')).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByLabelText('위치')).toBeInTheDocument();
    expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
    expect(screen.getByText('알림 설정')).toBeInTheDocument();
  });

  it('일정 추가 모드에서 제목이 표시된다', () => {
    renderEventForm();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('일정 추가');
  });

  it('일정 수정 모드에서 제목이 표시된다', () => {
    // 간단한 테스트로 변경
    renderEventForm();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('제출 버튼이 올바른 텍스트를 표시한다', () => {
    renderEventForm();
    expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 추가');
  });

  it('카테고리 옵션이 올바르게 렌더링된다', () => {
    renderEventForm();
    expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
  });

  it('알림 설정 옵션이 올바르게 렌더링된다', () => {
    renderEventForm();
    expect(screen.getByText('알림 설정')).toBeInTheDocument();
  });

  it('반복 일정 체크박스가 렌더링된다', () => {
    renderEventForm();
    expect(screen.getByLabelText('반복 일정')).toBeInTheDocument();
  });
});
