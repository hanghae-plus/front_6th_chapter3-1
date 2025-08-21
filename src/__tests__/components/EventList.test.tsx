import { render, screen } from '@testing-library/react';

// MUI Icons 모킹 (파일 디스크립터 한계 방지)
vi.mock('@mui/icons-material', () => ({
  Notifications: () => null,
  Edit: () => null,
  Delete: () => null,
}));

import { EventList } from '../../components/event/EventList';
import { createMockEvents } from '../utils';

const renderEventList = (props: Parameters<typeof EventList>[0]) =>
  render(<EventList {...props} />);

describe('EventList', () => {
  const mockEvents = createMockEvents();

  const mockSetSearchTerm = vi.fn();
  const mockEditEvent = vi.fn();
  const mockDeleteEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('검색 입력창과 일정 목록이 표시된다', () => {
    renderEventList({
      searchTerm: '',
      setSearchTerm: mockSetSearchTerm,
      filteredEvents: mockEvents,
      notifiedEvents: [],
      editEvent: mockEditEvent,
      deleteEvent: mockDeleteEvent,
    });

    expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
    expect(screen.getByTestId('event-list')).toBeInTheDocument();
  });

  it('일정 정보가 올바르게 표시된다', () => {
    renderEventList({
      searchTerm: '',
      setSearchTerm: mockSetSearchTerm,
      filteredEvents: mockEvents,
      notifiedEvents: [],
      editEvent: mockEditEvent,
      deleteEvent: mockDeleteEvent,
    });

    expect(screen.getByText('팀 회의')).toBeInTheDocument();
    expect(screen.getByText('회의실 A')).toBeInTheDocument();
  });

  it('반복 일정의 정보가 올바르게 표시된다', () => {
    renderEventList({
      searchTerm: '',
      setSearchTerm: mockSetSearchTerm,
      filteredEvents: mockEvents,
      notifiedEvents: [],
      editEvent: mockEditEvent,
      deleteEvent: mockDeleteEvent,
    });

    expect(screen.getByText('반복: 1주마다 (종료: 2025-12-31)')).toBeInTheDocument();
  });

  it('검색 결과가 없을 때 검색 결과가 없습니다. 라는 메시지가 표시된다', () => {
    renderEventList({
      searchTerm: '',
      setSearchTerm: mockSetSearchTerm,
      filteredEvents: [],
      notifiedEvents: [],
      editEvent: mockEditEvent,
      deleteEvent: mockDeleteEvent,
    });

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});
