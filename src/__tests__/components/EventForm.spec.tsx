import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import EventForm from '../../components/EventForm';
import { Event as EventType } from '../../types';

vi.mock('../../utils/timeValidation', () => ({
  getTimeErrorMessage: vi.fn(() => ({ startTimeError: '', endTimeError: '' })),
}));

const mockFormData = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '업무',
  isRepeating: false,
  repeatType: 'none',
  repeatInterval: 1,
  repeatEndDate: '',
  notificationTime: 10,
};

const mockErrors = {
  startTimeError: '',
  endTimeError: '',
};

const mockOnInputChange = vi.fn();
const mockOnSubmit = vi.fn();

const renderEventForm = (props = {}) => {
  const defaultProps = {
    formData: mockFormData,
    errors: mockErrors,
    editingEvent: null,
    onInputChange: mockOnInputChange,
    onSubmit: mockOnSubmit,
    ...props,
  };

  return render(<EventForm {...defaultProps} />);
};

describe('EventForm 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('일정 추가 모드에서 제목이 올바르게 표시된다', () => {
      renderEventForm();

      const titleElement = screen.getByTestId('form-title');
      expect(titleElement).toHaveTextContent('일정 추가');
    });

    it('일정 수정 모드에서 제목이 올바르게 표시된다', () => {
      const editingEvent: EventType = {
        id: '1',
        title: '기존 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '테스트 설명',
        location: '테스트 위치',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      renderEventForm({ editingEvent });

      const titleElement = screen.getByTestId('form-title');
      expect(titleElement).toHaveTextContent('일정 수정');
    });

    it('모든 필수 폼 필드가 렌더링된다', () => {
      renderEventForm();

      expect(screen.getByLabelText('제목')).toBeInTheDocument();
      expect(screen.getByLabelText('날짜')).toBeInTheDocument();
      expect(screen.getByLabelText('시작 시간')).toBeInTheDocument();
      expect(screen.getByLabelText('종료 시간')).toBeInTheDocument();
      expect(screen.getByLabelText('설명')).toBeInTheDocument();
      expect(screen.getByLabelText('위치')).toBeInTheDocument();
      expect(screen.getByTestId('category-select')).toBeInTheDocument();
      expect(screen.getByTestId('notification-select')).toBeInTheDocument();
    });
  });

  describe('입력 처리 테스트', () => {
    it('제목 입력 시 onInputChange가 호출된다', async () => {
      const user = userEvent.setup();
      renderEventForm();

      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.paste('새로운 일정');

      expect(mockOnInputChange).toHaveBeenLastCalledWith('title', '새로운 일정');
    });

    it('날짜 입력 시 onInputChange가 호출된다', async () => {
      const user = userEvent.setup();
      renderEventForm();

      const dateInput = screen.getByLabelText('날짜');
      await user.clear(dateInput);
      await user.paste('2025-01-01');

      expect(mockOnInputChange).toHaveBeenLastCalledWith('date', '2025-01-01');
    });

    it('시작 시간 입력 시 onInputChange가 호출된다', async () => {
      const user = userEvent.setup();
      renderEventForm();

      const startTimeInput = screen.getByLabelText('시작 시간');
      await user.clear(startTimeInput);
      await user.paste('09:00');

      expect(mockOnInputChange).toHaveBeenLastCalledWith('startTime', '09:00');
    });

    it('종료 시간 입력 시 onInputChange가 호출된다', async () => {
      const user = userEvent.setup();
      renderEventForm();

      const endTimeInput = screen.getByLabelText('종료 시간');
      await user.clear(endTimeInput);
      await user.paste('10:00');

      expect(mockOnInputChange).toHaveBeenLastCalledWith('endTime', '10:00');
    });

    it('설명 입력 시 onInputChange가 호출된다', async () => {
      const user = userEvent.setup();
      renderEventForm();

      const descriptionInput = screen.getByLabelText('설명');
      await user.clear(descriptionInput);
      await user.paste('테스트 설명');

      expect(mockOnInputChange).toHaveBeenLastCalledWith('description', '테스트 설명');
    });

    it('위치 입력 시 onInputChange가 호출된다', async () => {
      const user = userEvent.setup();
      renderEventForm();

      const locationInput = screen.getByLabelText('위치');
      await user.clear(locationInput);
      await user.paste('테스트 위치');

      expect(mockOnInputChange).toHaveBeenLastCalledWith('location', '테스트 위치');
    });
  });

  describe('카테고리 선택 테스트', () => {
    it('카테고리 드롭다운이 렌더링된다', () => {
      renderEventForm();

      expect(screen.getByTestId('category-select')).toBeInTheDocument();
    });

    it('카테고리 기본값이 올바르게 표시된다', () => {
      renderEventForm();

      expect(screen.getByText('업무')).toBeInTheDocument();
    });

    it('카테고리 변경 시 onInputChange가 호출된다', async () => {
      const user = userEvent.setup();
      renderEventForm();

      const categorySelects = screen.getAllByRole('combobox');
      const categorySelect = categorySelects[0];

      await user.click(categorySelect);

      const option = await screen.findByRole('option', { name: /개인/ });
      await user.click(option);

      expect(mockOnInputChange).toHaveBeenCalledWith('category', '개인');
    });
  });

  describe('반복 일정 체크박스 테스트', () => {
    it('반복 일정 체크박스가 렌더링된다', () => {
      renderEventForm();

      expect(screen.getByLabelText('반복 일정')).toBeInTheDocument();
    });

    it('반복 일정 체크박스 클릭 시 onInputChange가 호출된다', async () => {
      const user = userEvent.setup();
      renderEventForm();

      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);

      expect(mockOnInputChange).toHaveBeenCalledWith('isRepeating', true);
    });
  });

  describe('알림 설정 테스트', () => {
    it('알림 설정 드롭다운이 렌더링된다', () => {
      renderEventForm();

      expect(screen.getByTestId('notification-select')).toBeInTheDocument();
    });

    it('알림 설정 기본값이 올바르게 표시된다', () => {
      renderEventForm();

      expect(screen.getByText('10분 전')).toBeInTheDocument();
    });

    it('알림 설정 변경 시 onInputChange가 호출된다', async () => {
      const user = userEvent.setup();
      renderEventForm();

      const notificationSelects = screen.getAllByRole('combobox');
      const notificationSelect = notificationSelects[1];

      await user.click(notificationSelect);

      const option = await screen.findByRole('option', { name: /1시간 전/ });
      await user.click(option);

      expect(mockOnInputChange).toHaveBeenCalledWith('notificationTime', 60);
    });
  });

  describe('시간 검증 테스트', () => {
    it('시작 시간에 에러가 있을 때 에러 상태가 표시된다', () => {
      renderEventForm({
        errors: { ...mockErrors, startTimeError: '시작 시간 오류' },
      });

      const startTimeInput = screen.getByLabelText('시작 시간');
      expect(startTimeInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('종료 시간에 에러가 있을 때 에러 상태가 표시된다', () => {
      renderEventForm({
        errors: { ...mockErrors, endTimeError: '종료 시간 오류' },
      });

      const endTimeInput = screen.getByLabelText('종료 시간');
      expect(endTimeInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('폼 제출 테스트', () => {
    it('제출 버튼 클릭 시 onSubmit이 호출된다', async () => {
      const user = userEvent.setup();
      renderEventForm();

      const submitButton = screen.getByTestId('event-submit-button');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('일정 추가 모드에서 제출 버튼 텍스트가 올바르다', () => {
      renderEventForm();

      const submitButton = screen.getByTestId('event-submit-button');
      expect(submitButton).toHaveTextContent('일정 추가');
    });

    it('일정 수정 모드에서 제출 버튼 텍스트가 올바르다', () => {
      const editingEvent: EventType = {
        id: '1',
        title: '기존 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '테스트 설명',
        location: '테스트 위치',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      renderEventForm({ editingEvent });

      const submitButton = screen.getByTestId('event-submit-button');
      expect(submitButton).toHaveTextContent('일정 수정');
    });
  });

  describe('폼 상태 테스트', () => {
    it('폼 데이터가 올바르게 표시된다', () => {
      const formDataWithValues = {
        ...mockFormData,
        title: '테스트 제목',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '테스트 설명',
        location: '테스트 위치',
        category: '개인',
        notificationTime: 60,
      };

      renderEventForm({ formData: formDataWithValues });

      expect(screen.getByDisplayValue('테스트 제목')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2025-01-01')).toBeInTheDocument();
      expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('테스트 설명')).toBeInTheDocument();
      expect(screen.getByDisplayValue('테스트 위치')).toBeInTheDocument();
    });
  });
});
