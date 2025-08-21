import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';

import { CalendarView } from '../../components/CalendarView';
import type { Event } from '../../types';

const setup = (props: Partial<ComponentProps<typeof CalendarView>> = {}) => {
  const user = userEvent.setup();
  return {
    ...render(
      <CalendarView
        {...{
          view: 'month',
          setView: () => {},
          currentDate: new Date(),
          navigate: () => {},
          filteredEvents: [],
          notifiedEvents: [],
          holidays: {},
          ...props,
        }}
      />
    ),
    user,
  };
};

it('뷰 타입을 변경하면 setView 함수가 호출된다.', async () => {
  const mockSetView = vi.fn();
  const { user } = setup({ setView: mockSetView });

  const viewSelect = screen.getByLabelText('뷰 타입 선택');
  await user.click(within(viewSelect).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: 'week-option' }));

  expect(mockSetView).toHaveBeenCalledWith('week');
});

it('이전/다음 버튼을 클릭하면 navigate 함수가 호출된다.', async () => {
  const mockNavigate = vi.fn();
  const { user } = setup({ navigate: mockNavigate });

  await user.click(screen.getByLabelText('Previous'));
  expect(mockNavigate).toHaveBeenCalledWith('prev');

  await user.click(screen.getByLabelText('Next'));
  expect(mockNavigate).toHaveBeenCalledWith('next');
});

it('전달된 이벤트들이 올바르게 렌더링된다.', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 일정 1',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'none', interval: 1 },
    },
    {
      id: '2',
      title: '테스트 일정 2',
      date: '2025-10-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '테스트 설명 2',
      location: '테스트 위치 2',
      category: '개인',
      notificationTime: 0,
      repeat: { type: 'none', interval: 1 },
    },
  ];

  setup({ filteredEvents: mockEvents, currentDate: new Date('2025-10-01') });

  expect(screen.getByText('테스트 일정 1')).toBeInTheDocument();
  expect(screen.getByText('테스트 일정 2')).toBeInTheDocument();
});

it('알림된 이벤트는 특별한 스타일로 표시된다.', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '알림된 일정',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'none', interval: 1 },
    },
  ];

  setup({
    filteredEvents: mockEvents,
    notifiedEvents: ['1'],
    currentDate: new Date('2025-01-15'),
  });

  expect(screen.getByText('알림된 일정')).toBeInTheDocument();
  expect(screen.getByTestId('NotificationsIcon')).toBeInTheDocument();
});

it('공휴일이 올바르게 표시된다.', () => {
  const holidays = {
    '2025-01-01': '신정',
  };

  setup({
    holidays,
    currentDate: new Date('2025-01-01'),
  });

  expect(screen.getByText('신정')).toBeInTheDocument();
});
