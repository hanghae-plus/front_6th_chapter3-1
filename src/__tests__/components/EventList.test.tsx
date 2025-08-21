import { render, screen } from '@testing-library/react';

import { EventList } from '../../components/event/EventList';
import { Event } from '../../types';

describe('EventList', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-01-15',
      startTime: '12:00',
      endTime: '13:00',
      description: '팀원들과 점심',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
      notificationTime: 30,
    },
  ];

  const mockSetSearchTerm = vi.fn();
  const mockEditEvent = vi.fn();
  const mockDeleteEvent = vi.fn();

  beforeEach(() => {
    mockSetSearchTerm.mockClear();
    mockEditEvent.mockClear();
    mockDeleteEvent.mockClear();
  });

  it('검색 입력창과 일정 목록이 표시된다', () => {
    render(
      <EventList
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        filteredEvents={mockEvents}
        notifiedEvents={[]}
        editEvent={mockEditEvent}
        deleteEvent={mockDeleteEvent}
      />
    );

    expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
    expect(screen.getByTestId('event-list')).toBeInTheDocument();
  });

  it('일정 정보가 올바르게 표시된다', () => {
    render(
      <EventList
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        filteredEvents={mockEvents}
        notifiedEvents={[]}
        editEvent={mockEditEvent}
        deleteEvent={mockDeleteEvent}
      />
    );

    expect(screen.getByText('팀 회의')).toBeInTheDocument();
    expect(screen.getByText('회의실 A')).toBeInTheDocument();
  });

  it('반복 일정의 정보가 올바르게 표시된다', () => {
    render(
      <EventList
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        filteredEvents={mockEvents}
        notifiedEvents={[]}
        editEvent={mockEditEvent}
        deleteEvent={mockDeleteEvent}
      />
    );

    expect(screen.getByText('반복: 1주마다 (종료: 2025-12-31)')).toBeInTheDocument();
  });

  it('알림이 필요한 일정에 알림 아이콘이 표시된다', () => {
    render(
      <EventList
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        filteredEvents={mockEvents}
        notifiedEvents={['1']}
        editEvent={mockEditEvent}
        deleteEvent={mockDeleteEvent}
      />
    );

    const notificationIcon = screen.getByTestId('notification-icon');
    expect(notificationIcon).toBeInTheDocument();
  });

  it('검색 결과가 없을 때 검색 결과가 없습니다. 라는 메시지가 표시된다', () => {
    render(
      <EventList
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        filteredEvents={[]}
        notifiedEvents={[]}
        editEvent={mockEditEvent}
        deleteEvent={mockDeleteEvent}
      />
    );

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});
