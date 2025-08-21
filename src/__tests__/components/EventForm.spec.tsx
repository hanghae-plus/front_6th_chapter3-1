import { fireEvent, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { EventForm } from '../../components/EventForm';
import { Event } from '../../types';
import { renderWithProvider } from '../renderProvider';
import { createTestEvent } from '../utils';

describe('EventForm 컴포넌트', () => {
  const mockEvents: Event[] = [
    createTestEvent({
      title: '기존 이벤트',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
    }),
  ];

  const defaultProps = {
    events: mockEvents,
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
    repeatType: 'none' as const,
    repeatInterval: 1,
    repeatEndDate: undefined,
    notificationTime: 10,
    setNotificationTime: vi.fn(),
    startTimeError: null,
    endTimeError: null,
    editingEvent: null,
    handleStartTimeChange: vi.fn(),
    handleEndTimeChange: vi.fn(),
    resetForm: vi.fn(),
    onSaveEvent: vi.fn(),
    onOverlapDetected: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('폼 렌더링', () => {
    it('일정 추가 모드에서 모든 필수 폼 필드가 올바르게 렌더링된다', () => {
      renderWithProvider(<EventForm {...defaultProps} />);

      expect(screen.getByRole('heading', { name: '일정 추가' })).toBeInTheDocument();

      expect(screen.getByLabelText('제목')).toBeInTheDocument();
      expect(screen.getByLabelText('날짜')).toBeInTheDocument();
      expect(screen.getByLabelText('시작 시간')).toBeInTheDocument();
      expect(screen.getByLabelText('종료 시간')).toBeInTheDocument();
      expect(screen.getByLabelText('설명')).toBeInTheDocument();
      expect(screen.getByLabelText('위치')).toBeInTheDocument();
      expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
      expect(screen.getByText('알림 설정')).toBeInTheDocument();

      expect(screen.getByTestId('event-submit-button')).toBeInTheDocument();
    });

    it('일정 수정 모드에서 폼 제목과 버튼이 올바르게 변경된다', () => {
      const editingEvent = createTestEvent({
        title: '수정할 이벤트',
        date: '2025-01-15',
      });

      renderWithProvider(<EventForm {...defaultProps} editingEvent={editingEvent} />);

      // 수정 모드 제목 확인
      expect(screen.getByRole('heading', { name: '일정 수정' })).toBeInTheDocument();

      const saveButton = screen.getByTestId('event-submit-button');
      expect(saveButton).toHaveTextContent('일정 수정');
    });
  });

  describe('사용자 입력 처리', () => {
    it('제목 입력 시 setTitle이 올바르게 호출된다', () => {
      renderWithProvider(<EventForm {...defaultProps} />);

      const titleInput = screen.getByLabelText('제목');
      fireEvent.change(titleInput, { target: { value: '새 이벤트' } });

      expect(defaultProps.setTitle).toHaveBeenCalledWith('새 이벤트');
    });

    it('날짜 선택 시 setDate가 올바르게 호출된다', () => {
      renderWithProvider(<EventForm {...defaultProps} />);

      const dateInput = screen.getByLabelText('날짜');
      fireEvent.change(dateInput, { target: { value: '2025-01-20' } });

      expect(defaultProps.setDate).toHaveBeenCalledWith('2025-01-20');
    });

    it('카테고리 필드가 렌더링되고 현재 값이 표시된다', () => {
      const propsWithCategory = {
        ...defaultProps,
        category: '개인',
      };

      renderWithProvider(<EventForm {...propsWithCategory} />);

      // 카테고리 필드가 존재하는지 확인
      const categorySelect = screen.getByLabelText('카테고리');
      expect(categorySelect).toBeInTheDocument();

      expect(categorySelect).toHaveTextContent('개인');
    });

    it('반복 설정 체크박스 클릭 시 setIsRepeating이 호출된다', () => {
      renderWithProvider(<EventForm {...defaultProps} />);

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      fireEvent.click(repeatCheckbox);

      expect(defaultProps.setIsRepeating).toHaveBeenCalledWith(true);
    });
  });

  describe('폼 유효성 검사 및 저장', () => {
    it('필수 정보가 누락된 경우 에러 토스트가 표시된다', async () => {
      renderWithProvider(
        <EventForm
          {...defaultProps}
          title="" // 제목 없음
          date="" // 날짜 없음
        />
      );

      const saveButton = screen.getByTestId('event-submit-button');
      fireEvent.click(saveButton);

      expect(await screen.findByText('필수 정보를 모두 입력해주세요.')).toBeInTheDocument();

      // onSaveEvent가 호출되지 않았는지 확인
      expect(defaultProps.onSaveEvent).not.toHaveBeenCalled();
    });

    it('시간 유효성 검사 에러가 있는 경우 에러 토스트가 표시된다', async () => {
      renderWithProvider(
        <EventForm
          {...defaultProps}
          title="테스트 이벤트"
          date="2025-01-20"
          startTime="14:00"
          endTime="13:00" // 종료 시간이 시작 시간보다 빠름
          startTimeError="시작 시간은 종료 시간보다 빨라야 합니다."
          endTimeError="종료 시간은 시작 시간보다 늦어야 합니다."
        />
      );

      const saveButton = screen.getByTestId('event-submit-button');
      fireEvent.click(saveButton);

      expect(await screen.findByText('시간 설정을 확인해주세요.')).toBeInTheDocument();

      expect(defaultProps.onSaveEvent).not.toHaveBeenCalled();
    });

    it('모든 정보가 올바르게 입력된 경우 일정이 저장된다', async () => {
      const validProps = {
        ...defaultProps,
        title: '새 이벤트',
        date: '2025-01-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '테스트 설명',
        location: '회의실',
        category: '업무',
        notificationTime: 10,
      };

      renderWithProvider(<EventForm {...validProps} />);

      const saveButton = screen.getByTestId('event-submit-button');
      fireEvent.click(saveButton);

      // onSaveEvent가 올바른 데이터와 함께 호출되었는지 확인
      await waitFor(() => {
        expect(validProps.onSaveEvent).toHaveBeenCalledWith({
          id: undefined,
          title: '새 이벤트',
          date: '2025-01-20',
          startTime: '10:00',
          endTime: '11:00',
          description: '테스트 설명',
          location: '회의실',
          category: '업무',
          repeat: {
            type: 'none',
            interval: 1,
            endDate: undefined,
          },
          notificationTime: 10,
        });
      });
    });

    it('일정 겹침이 감지되면 onOverlapDetected가 호출된다', async () => {
      // 겹치는 시간의 기존 이벤트
      const overlappingEvents = [
        createTestEvent({
          title: '겹치는 이벤트',
          date: '2025-01-20',
          startTime: '10:30',
          endTime: '11:30',
        }),
      ];

      const propsWithOverlap = {
        ...defaultProps,
        events: overlappingEvents,
        title: '새 이벤트',
        date: '2025-01-20',
        startTime: '10:00',
        endTime: '11:00',
      };

      renderWithProvider(<EventForm {...propsWithOverlap} />);

      const saveButton = screen.getByTestId('event-submit-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(propsWithOverlap.onOverlapDetected).toHaveBeenCalledWith(overlappingEvents);
      });
    });
  });

  describe('일정 수정 모드', () => {
    it('수정 모드에서 기존 이벤트 정보로 폼이 초기화되어 저장시 id가 포함된다', async () => {
      const editingEvent = createTestEvent({
        id: 'edit-123',
        title: '수정할 이벤트',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '10:00',
      });

      const editProps = {
        ...defaultProps,
        editingEvent,
        title: '수정된 이벤트',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '10:00',
      };

      renderWithProvider(<EventForm {...editProps} />);

      const saveButton = screen.getByTestId('event-submit-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(editProps.onSaveEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'edit-123',
            title: '수정된 이벤트',
          })
        );
      });
    });
  });
});
