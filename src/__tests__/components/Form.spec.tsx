import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';

import { Form } from '../../components/Form';
import type { Event } from '../../types';

const setup = (props: Partial<ComponentProps<typeof Form>> = {}) => {
  const user = userEvent.setup();

  return {
    ...render(
      <Form
        {...{
          editingEvent: null,
          title: '',
          setTitle: () => {},
          date: '',
          setDate: () => {},
          startTime: '',
          endTime: '',
          description: '',
          setDescription: () => {},
          location: '',
          setLocation: () => {},
          category: '',
          setCategory: () => {},
          isRepeating: false,
          setIsRepeating: () => {},
          notificationTime: 0,
          setNotificationTime: () => {},
          startTimeError: '',
          endTimeError: '',
          handleStartTimeChange: () => {},
          handleEndTimeChange: () => {},
          addOrUpdateEvent: async () => {},
          ...props,
        }}
      />
    ),
    user,
  };
};

it('컴포넌트가 렌더링 된다.', () => {
  setup();

  expect(
    screen.getByText('일정 추가', {
      selector: 'h4',
    })
  ).toBeInTheDocument();
  expect(screen.getByLabelText('제목')).toBeInTheDocument();
  expect(screen.getByLabelText('날짜')).toBeInTheDocument();
  expect(screen.getByLabelText('시작 시간')).toBeInTheDocument();
  expect(screen.getByLabelText('종료 시간')).toBeInTheDocument();
  expect(screen.getByLabelText('설명')).toBeInTheDocument();
  expect(screen.getByLabelText('위치')).toBeInTheDocument();
  expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
  expect(screen.getByText('반복 일정')).toBeInTheDocument();
  expect(screen.getByText('알림 설정')).toBeInTheDocument();
  expect(screen.getByTestId('event-submit-button')).toBeInTheDocument();
});

it('전달된 값들이 렌더링 된다.', () => {
  setup({
    title: '테스트 제목',
    date: '2025-01-01',
    startTime: '12:00',
    endTime: '13:00',
    description: '테스트 설명',
    location: '테스트 위치',
    category: '업무',
    isRepeating: true,
    notificationTime: 10,
  });

  expect(screen.getByLabelText('제목')).toHaveValue('테스트 제목');
  expect(screen.getByLabelText('날짜')).toHaveValue('2025-01-01');
  expect(screen.getByLabelText('시작 시간')).toHaveValue('12:00');
  expect(screen.getByLabelText('종료 시간')).toHaveValue('13:00');
  expect(screen.getByLabelText('설명')).toHaveValue('테스트 설명');
  expect(screen.getByLabelText('위치')).toHaveValue('테스트 위치');
  expect(screen.getByText('업무')).toBeInTheDocument();
  const repeatingCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
  expect(repeatingCheckbox).toBeChecked();
  expect(screen.getByText('10분 전')).toBeInTheDocument();
  expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 추가');
});

it('editingEvent가 있을 때 수정 모드로 렌더링 된다.', () => {
  const mockEditingEvent: Event = {
    id: '1',
    title: '수정할 일정',
    date: '2025-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '수정할 설명',
    location: '수정할 위치',
    category: '개인',
    notificationTime: 10,
    repeat: {
      type: 'none',
      interval: 1,
    },
  };

  setup({
    editingEvent: mockEditingEvent,
  });

  expect(
    screen.getByText('일정 수정', {
      selector: 'h4',
    })
  ).toBeInTheDocument();
  expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 수정');
});

it('사용자가 입력 필드를 변경하면 setter 함수가 호출된다.', async () => {
  const mockSetTitle = vi.fn();
  const mockSetDate = vi.fn();
  const mockSetDescription = vi.fn();
  const mockSetLocation = vi.fn();
  const mockSetCategory = vi.fn();
  const mockSetIsRepeating = vi.fn();
  const mockSetNotificationTime = vi.fn();

  const { user } = setup({
    setTitle: mockSetTitle,
    setDate: mockSetDate,
    setDescription: mockSetDescription,
    setLocation: mockSetLocation,
    setCategory: mockSetCategory,
    setIsRepeating: mockSetIsRepeating,
    setNotificationTime: mockSetNotificationTime,
  });

  await user.type(screen.getByLabelText('제목'), '새로운 제목');
  expect(mockSetTitle).toBeCalled();

  await user.clear(screen.getByLabelText('날짜'));
  await user.type(screen.getByLabelText('날짜'), '2025-02-01');
  expect(mockSetDate).toBeCalled();

  await user.type(screen.getByLabelText('설명'), '새로운 설명');
  expect(mockSetDescription).toBeCalled();

  await user.type(screen.getByLabelText('위치'), '새로운 위치');
  expect(mockSetLocation).toBeCalled();

  const categorySelect = screen.getByLabelText('카테고리');
  await user.click(categorySelect);
  await user.click(within(categorySelect).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: '개인-option' }));
  expect(mockSetCategory).toBeCalled();

  await user.click(screen.getByRole('checkbox', { name: '반복 일정' }));
  expect(mockSetIsRepeating).toBeCalled();

  const notificationSelect = document.querySelector(
    '[aria-labelledby="notification"]'
  )! as HTMLDivElement;
  await user.click(notificationSelect);
  await user.click(screen.getByRole('option', { name: '1시간 전' }));
  expect(mockSetNotificationTime).toBeCalled();
});

it('시간 입력 에러가 있을 때 에러 상태가 올바르게 표시된다.', () => {
  setup({
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
  });

  expect(screen.getByText('시작 시간은 종료 시간보다 빨라야 합니다.')).toBeInTheDocument();
  expect(screen.getByText('종료 시간은 시작 시간보다 늦어야 합니다.')).toBeInTheDocument();
});
