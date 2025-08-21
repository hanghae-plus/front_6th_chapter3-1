import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';

import { EventList } from '../../components/EventList';
import type { Event } from '../../types';

const setup = (props: Partial<ComponentProps<typeof EventList>> = {}) => {
  const user = userEvent.setup();
  return {
    ...render(
      <EventList
        {...{
          filteredEvents: [],
          searchTerm: '',
          setSearchTerm: () => {},
          notifiedEvents: [],
          editEvent: () => {},
          deleteEvent: () => {},
          ...props,
        }}
      />
    ),
    user,
  };
};

it('검색어를 입력하면 setSearchTerm 함수가 호출된다.', async () => {
  const mockSetSearchTerm = vi.fn();
  const { user } = setup({ setSearchTerm: mockSetSearchTerm });

  const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
  await user.type(searchInput, '테스트 검색어');

  expect(mockSetSearchTerm).toBeCalled();
});

it('전달된 이벤트들이 올바르게 렌더링된다.', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 일정 1',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명 1',
      location: '테스트 위치 1',
      category: '업무',
      notificationTime: 10,
      repeat: { type: 'none', interval: 1 },
    },
    {
      id: '2',
      title: '테스트 일정 2',
      date: '2025-01-16',
      startTime: '14:00',
      endTime: '15:00',
      description: '테스트 설명 2',
      location: '테스트 위치 2',
      category: '개인',
      notificationTime: 60,
      repeat: { type: 'none', interval: 1 },
    },
  ];

  setup({ filteredEvents: mockEvents });

  expect(screen.getByText('테스트 일정 1')).toBeInTheDocument();
  expect(screen.getByText('2025-01-15')).toBeInTheDocument();
  expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
  expect(screen.getByText('테스트 설명 1')).toBeInTheDocument();
  expect(screen.getByText('테스트 위치 1')).toBeInTheDocument();
  expect(screen.getByText('카테고리: 업무')).toBeInTheDocument();
  expect(screen.getByText('알림: 10분 전')).toBeInTheDocument();

  expect(screen.getByText('테스트 일정 2')).toBeInTheDocument();
  expect(screen.getByText('2025-01-16')).toBeInTheDocument();
  expect(screen.getByText('14:00 - 15:00')).toBeInTheDocument();
  expect(screen.getByText('테스트 설명 2')).toBeInTheDocument();
  expect(screen.getByText('테스트 위치 2')).toBeInTheDocument();
  expect(screen.getByText('카테고리: 개인')).toBeInTheDocument();
  expect(screen.getByText('알림: 1시간 전')).toBeInTheDocument();
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
  });

  expect(screen.getByText('알림된 일정')).toBeInTheDocument();
  expect(screen.getByTestId('NotificationsIcon')).toBeInTheDocument();
});

it('편집/삭제 버튼을 클릭하면 해당 함수가 호출된다.', async () => {
  const mockEditEvent = vi.fn();
  const mockDeleteEvent = vi.fn();

  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 일정',
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

  const { user } = setup({
    filteredEvents: mockEvents,
    editEvent: mockEditEvent,
    deleteEvent: mockDeleteEvent,
  });

  await user.click(screen.getByLabelText('Edit event'));
  expect(mockEditEvent).toBeCalled();

  await user.click(screen.getByLabelText('Delete event'));
  expect(mockDeleteEvent).toBeCalled();
});

it('반복 일정 정보가 올바르게 표시된다.', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '반복 일정',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '업무',
      notificationTime: 10,
      repeat: {
        type: 'weekly',
        interval: 2,
        endDate: '2025-12-31',
      },
    },
  ];

  setup({ filteredEvents: mockEvents });

  expect(screen.getByText('반복: 2주마다 (종료: 2025-12-31)')).toBeInTheDocument();
});
