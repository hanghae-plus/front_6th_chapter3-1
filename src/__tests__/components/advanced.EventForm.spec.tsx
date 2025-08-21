import '@testing-library/jest-dom';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { events } from '../../__mocks__/fixture/mockEvents.json';
import { EventForm } from '../../components/EventForm';
import { Event } from '../../types';

const mockEditingEvent = events[0] as Event;

// NOTE: 해당 테스트코드 내부에 skip 처리된 테스트는 통과는 시켰지만 코드가 유의미한가?라는 의문이 있어 skip 처리했습니다.
// 의문을 가진 이유는 다음과 같습니다.
// 단순히 presentation의 용도인 컴포넌트를 렌더링 테스트만 하는 것이 아니라
// 중요 기능을 통합테스트에서 검증이 가능함에도 불구하고 컴포넌트에서 모킹하여 호출 여부만을 확인하는 것이 바람직한가?
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
    handleStartTimeChange: vi.fn(),
    handleEndTimeChange: vi.fn(),
    editingEvent: null,
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('모드별 제목과 버튼 표시', () => {
    it('추가 모드일 때 "일정 추가" 제목과 버튼이 표시되어야 한다', () => {
      // Given & When: 추가 모드로 렌더링하면
      render(<EventForm {...mockProps} />);

      // Then: 추가 모드 텍스트가 표시되어야 한다
      expect(screen.getByRole('heading', { name: '일정 추가' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '일정 추가' })).toBeInTheDocument();
    });

    it('편집 모드일 때 "일정 수정" 제목과 버튼이 표시되어야 한다', () => {
      // Given & When: 편집 모드로 렌더링하면
      render(<EventForm {...mockProps} editingEvent={mockEditingEvent} />);

      // Then: 편집 모드 텍스트가 표시되어야 한다
      expect(screen.getByRole('heading', { name: '일정 수정' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '일정 수정' })).toBeInTheDocument();
    });
  });

  describe('폼 필드 값 표시', () => {
    it('전달받은 props 값이 폼 필드에 표시되어야 한다', () => {
      // Given & When: 값이 있는 props로 렌더링하면
      render(
        <EventForm
          {...mockProps}
          title="테스트 제목"
          date="2025-08-17"
          description="테스트 설명"
          location="테스트 위치"
        />
      );

      // Then: 해당 값들이 폼 필드에 표시되어야 한다
      expect(screen.getByDisplayValue('테스트 제목')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2025-08-17')).toBeInTheDocument();
      expect(screen.getByDisplayValue('테스트 설명')).toBeInTheDocument();
      expect(screen.getByDisplayValue('테스트 위치')).toBeInTheDocument();
    });
  });

  describe.skip('사용자 입력 처리', () => {
    it('제목 입력 시 setTitle이 호출되어야 한다', async () => {
      // Given: EventForm이 렌더링된 상태
      const user = userEvent.setup();
      render(<EventForm {...mockProps} />);

      // When: 제목 필드에 텍스트를 입력하면
      const titleInput = screen.getByLabelText('제목');
      await user.type(titleInput, '새 제목');

      // Then: setTitle이 각 글자마다 호출되어야 한다
      expect(mockProps.setTitle).toHaveBeenCalledWith('새');
      expect(mockProps.setTitle).toHaveBeenCalledWith('제');
      expect(mockProps.setTitle).toHaveBeenCalledWith('목');
    });

    it('카테고리 선택 시 setCategory가 호출되어야 한다', async () => {
      // Given: EventForm이 렌더링된 상태
      const user = userEvent.setup();
      render(<EventForm {...mockProps} />);

      // When: 카테고리를 변경하면
      const categorySelect = screen.getByLabelText('카테고리');
      const combobox = within(categorySelect).getByRole('combobox');
      await user.click(combobox);
      await user.click(screen.getByText('개인'));

      // Then: setCategory가 호출되어야 한다
      expect(mockProps.setCategory).toHaveBeenCalledWith('개인');
    });

    it('반복 일정 체크박스 클릭 시 setIsRepeating이 호출되어야 한다', async () => {
      // Given: EventForm이 렌더링된 상태
      const user = userEvent.setup();
      render(<EventForm {...mockProps} />);

      // When: 반복 일정 체크박스를 클릭하면
      const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
      await user.click(repeatCheckbox);

      // Then: setIsRepeating이 true로 호출되어야 한다
      expect(mockProps.setIsRepeating).toHaveBeenCalledWith(true);
    });
  });

  describe.skip('시간 필드 처리', () => {
    it('시작 시간 입력 시 handleStartTimeChange가 호출되어야 한다', async () => {
      // Given: EventForm이 렌더링된 상태
      const user = userEvent.setup();
      render(<EventForm {...mockProps} />);

      // When: 시작 시간을 입력하면
      const startTimeInput = screen.getByLabelText('시작 시간');
      await user.type(startTimeInput, '10:00');

      // Then: handleStartTimeChange가 호출되어야 한다
      expect(mockProps.handleStartTimeChange).toHaveBeenCalled();
    });

    it('종료 시간 입력 시 handleEndTimeChange가 호출되어야 한다', async () => {
      // Given: EventForm이 렌더링된 상태
      const user = userEvent.setup();
      render(<EventForm {...mockProps} />);

      // When: 종료 시간을 입력하면
      const endTimeInput = screen.getByLabelText('종료 시간');
      await user.type(endTimeInput, '11:00');

      // Then: handleEndTimeChange가 호출되어야 한다
      expect(mockProps.handleEndTimeChange).toHaveBeenCalled();
    });
  });

  describe('시간 에러 표시', () => {
    it('시간 에러가 있을 때 에러 상태가 표시되어야 한다', () => {
      // Given & When: 시간 에러가 있는 상태로 렌더링하면
      render(
        <EventForm
          {...mockProps}
          startTimeError="시작 시간은 종료 시간보다 빨라야 합니다."
          endTimeError="종료 시간은 시작 시간보다 늦어야 합니다."
        />
      );

      // Then: 시간 입력 필드들이 에러 상태로 표시되어야 한다
      const startTimeInput = screen.getByLabelText('시작 시간');
      const endTimeInput = screen.getByLabelText('종료 시간');

      expect(startTimeInput).toHaveAttribute('aria-invalid', 'true');
      expect(endTimeInput).toHaveAttribute('aria-invalid', 'true');
    });

    describe.skip('폼 제출', () => {
      it('제출 버튼 클릭 시 onSubmit이 호출되어야 한다', async () => {
        // Given: EventForm이 렌더링된 상태
        const user = userEvent.setup();
        render(<EventForm {...mockProps} />);

        // When: 제출 버튼을 클릭하면
        const submitButton = screen.getByTestId('event-submit-button');
        await user.click(submitButton);

        // Then: onSubmit이 호출되어야 한다
        expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
      });
    });
  });
});
