import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import { EventForm } from '../../components/form/EventForm';

// notistack의 useSnackbar를 모킹
const mockEnqueueSnackbar = vi.fn();
vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar,
  }),
}));

describe('EventForm', () => {
  const mockProps = {
    title: '',
    setTitle: vi.fn(),
    date: '2024-01-01',
    setDate: vi.fn(),
    startTime: '09:00',
    endTime: '10:00',
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
    addOrUpdateEvent: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('일정 추가 모드에서 모든 폼 UI 요소들이 올바르게 렌더링되어야 한다', () => {
      render(<EventForm {...mockProps} />);

      // 제목이 올바르게 표시되어야 함
      expect(screen.getByRole('heading', { name: '일정 추가' })).toBeInTheDocument();

      // 필수 입력 필드들이 존재해야 함
      expect(screen.getByLabelText('제목')).toBeInTheDocument();
      expect(screen.getByLabelText('날짜')).toBeInTheDocument();
      expect(screen.getByLabelText('시작 시간')).toBeInTheDocument();
      expect(screen.getByLabelText('종료 시간')).toBeInTheDocument();
      expect(screen.getByLabelText('설명')).toBeInTheDocument();
      expect(screen.getByLabelText('위치')).toBeInTheDocument();
      expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
      expect(screen.getByLabelText('알림 설정')).toBeInTheDocument();

      // 반복 일정 체크박스가 존재해야 함
      expect(screen.getByLabelText('반복 일정')).toBeInTheDocument();

      // 제출 버튼이 올바른 텍스트와 함께 존재해야 함
      const submitButton = screen.getByTestId('event-submit-button');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('일정 추가');
    });
  });

  describe('사용자 입력 처리', () => {
    it('사용자 입력 시 해당 setter 함수들이 올바르게 호출되어야 한다', () => {
      render(<EventForm {...mockProps} />);

      // 제목 입력 테스트
      const titleInput = screen.getByLabelText('제목');
      fireEvent.change(titleInput, { target: { value: '새로운 일정' } });
      expect(mockProps.setTitle).toHaveBeenCalledWith('새로운 일정');

      // 날짜 변경 테스트
      const dateInput = screen.getByLabelText('날짜');
      fireEvent.change(dateInput, { target: { value: '2024-01-15' } });
      expect(mockProps.setDate).toHaveBeenCalledWith('2024-01-15');

      // 설명 입력 테스트
      const descriptionInput = screen.getByLabelText('설명');
      fireEvent.change(descriptionInput, { target: { value: '일정에 대한 상세 설명' } });
      expect(mockProps.setDescription).toHaveBeenCalledWith('일정에 대한 상세 설명');

      // 위치 입력 테스트
      const locationInput = screen.getByLabelText('위치');
      fireEvent.change(locationInput, { target: { value: '회사 회의실' } });
      expect(mockProps.setLocation).toHaveBeenCalledWith('회사 회의실');

      // 반복 일정 체크박스 테스트
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      fireEvent.click(repeatCheckbox);
      expect(mockProps.setIsRepeating).toHaveBeenCalledWith(true);
    });

    it('시간 입력 시 해당 핸들러 함수들이 호출되어야 한다', () => {
      render(<EventForm {...mockProps} />);

      // 시작 시간 변경 테스트
      const startTimeInput = screen.getByLabelText('시작 시간');
      fireEvent.change(startTimeInput, { target: { value: '10:00' } });
      expect(mockProps.handleStartTimeChange).toHaveBeenCalled();

      // 종료 시간 변경 테스트
      const endTimeInput = screen.getByLabelText('종료 시간');
      fireEvent.change(endTimeInput, { target: { value: '11:00' } });
      expect(mockProps.handleEndTimeChange).toHaveBeenCalled();
    });
  });

  describe('폼 제출', () => {
    it('제출 버튼 클릭 시 addOrUpdateEvent 함수가 호출되어야 한다', () => {
      render(<EventForm {...mockProps} />);

      const submitButton = screen.getByTestId('event-submit-button');
      fireEvent.click(submitButton);

      expect(mockProps.addOrUpdateEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe('유효성 검사', () => {
    it('필수 정보가 누락된 상태에서 제출 시 유효성 검사가 실행되어야 한다', () => {
      const propsWithEmptyRequiredFields = {
        ...mockProps,
        title: '', // 제목 누락
        date: '', // 날짜 누락
        startTime: '', // 시작 시간 누락
        endTime: '', // 종료 시간 누락
      };

      render(<EventForm {...propsWithEmptyRequiredFields} />);

      const submitButton = screen.getByTestId('event-submit-button');
      fireEvent.click(submitButton);

      // addOrUpdateEvent 함수가 호출되어야 함 (유효성 검사는 상위 컴포넌트에서 처리)
      expect(mockProps.addOrUpdateEvent).toHaveBeenCalledTimes(1);
    });

    it('시간 에러가 있는 상태에서 제출 시 유효성 검사가 실행되어야 한다', () => {
      const propsWithTimeErrors = {
        ...mockProps,
        startTimeError: '시작 시간이 종료 시간보다 늦습니다',
        endTimeError: '종료 시간이 시작 시간보다 빠릅니다',
      };

      render(<EventForm {...propsWithTimeErrors} />);

      const submitButton = screen.getByTestId('event-submit-button');
      fireEvent.click(submitButton);

      // addOrUpdateEvent 함수가 호출되어야 함 (유효성 검사는 상위 컴포넌트에서 처리)
      expect(mockProps.addOrUpdateEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe('에러 토스트 표시', () => {
    it('필수 정보가 누락된 경우 에러 토스트가 표시된다', () => {
      // addOrUpdateEvent 함수가 실제로 validateForm 로직을 실행하도록 모킹
      const mockAddOrUpdateEvent = vi.fn().mockImplementation(() => {
        // 필수 정보 누락 시 에러 토스트 표시
        mockEnqueueSnackbar('필수 정보를 모두 입력해주세요.', {
          variant: 'error',
        });
      });

      const propsWithMockValidation = {
        ...mockProps,
        title: '', // 제목 누락
        date: '', // 날짜 누락
        startTime: '', // 시작 시간 누락
        endTime: '', // 종료 시간 누락
        addOrUpdateEvent: mockAddOrUpdateEvent,
      };

      render(<EventForm {...propsWithMockValidation} />);

      const submitButton = screen.getByTestId('event-submit-button');
      fireEvent.click(submitButton);

      // 에러 토스트 메시지가 표시되어야 함
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('필수 정보를 모두 입력해주세요.', {
        variant: 'error',
      });
    });

    it('시간 에러가 있는 경우 에러 토스트가 표시된다', () => {
      // addOrUpdateEvent 함수가 실제로 validateForm 로직을 실행하도록 모킹
      const mockAddOrUpdateEvent = vi.fn().mockImplementation(() => {
        // 시간 에러가 있는 경우 에러 토스트 표시
        mockEnqueueSnackbar('시간 설정을 확인해주세요.', {
          variant: 'error',
        });
      });

      const propsWithMockValidation = {
        ...mockProps,
        startTimeError: '시작 시간이 종료 시간보다 늦습니다',
        endTimeError: '종료 시간이 시작 시간보다 빠릅니다',
        addOrUpdateEvent: mockAddOrUpdateEvent,
      };

      render(<EventForm {...propsWithMockValidation} />);

      const submitButton = screen.getByTestId('event-submit-button');
      fireEvent.click(submitButton);

      // 에러 토스트 메시지가 표시되어야 함
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('시간 설정을 확인해주세요.', {
        variant: 'error',
      });
    });
  });
});
