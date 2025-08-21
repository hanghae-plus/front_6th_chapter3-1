import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { EventCardProps } from '../../components/EventCard';
import { EventList } from '../../components/EventList';
import { SearchBarProps } from '../../components/SearchBar';
import { createMockEvent } from '../utils';

// Mock 함수들
const mockOnSearchChange = vi.fn();
const mockOnEditEvent = vi.fn();
const mockOnDeleteEvent = vi.fn();

// EventCard와 SearchBar 컴포넌트를 mock
vi.mock('../../components/EventCard', () => ({
  EventCard: ({ event, isNotified, onEdit, onDelete }: EventCardProps) => (
    <div data-testid={`event-card-${event.id}`}>
      <span>{event.title}</span>
      <button onClick={() => onEdit(event)}>수정</button>
      <button onClick={() => onDelete(event.id)}>삭제</button>
      {isNotified && <span>🔔</span>}
    </div>
  ),
}));

vi.mock('../../components/SearchBar', () => ({
  SearchBar: ({ searchTerm, onSearchChange }: SearchBarProps) => (
    <input
      data-testid="search-input"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="일정 검색..."
    />
  ),
}));

describe('EventList: 이벤트 목록 컴포넌트', () => {
  const mockEvents = [
    createMockEvent(1, { title: '첫 번째 회의' }),
    createMockEvent(2, { title: '두 번째 회의' }),
  ];

  const defaultProps = {
    filteredEvents: mockEvents,
    notifiedEvents: ['1'],
    searchTerm: '',
    onSearchChange: mockOnSearchChange,
    onEditEvent: mockOnEditEvent,
    onDeleteEvent: mockOnDeleteEvent,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('이벤트 목록이 제대로 보여야 한다', () => {
    render(<EventList {...defaultProps} />);

    // 이벤트 목록 컨테이너가 있는지 확인
    expect(screen.getByTestId('event-list')).toBeInTheDocument();

    // 검색 입력창이 있는지 확인
    expect(screen.getByTestId('search-input')).toBeInTheDocument();

    // 이벤트 카드들이 보이는지 확인
    expect(screen.getByTestId('event-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('event-card-2')).toBeInTheDocument();
  });

  it('이벤트가 없으면 "검색 결과가 없습니다" 메시지를 보여야 한다', () => {
    const props = {
      ...defaultProps,
      filteredEvents: [],
    };

    render(<EventList {...props} />);

    // "검색 결과가 없습니다" 메시지가 보이는지 확인
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();

    // 이벤트 카드는 보이지 않아야 함
    expect(screen.queryByTestId('event-card-1')).not.toBeInTheDocument();
  });

  it('이벤트 수정 버튼을 누르면 onEditEvent가 호출되어야 한다', async () => {
    render(<EventList {...defaultProps} />);

    const user = userEvent.setup();

    // 첫 번째 이벤트의 수정 버튼 찾기
    const editButton = screen.getByTestId('event-card-1').querySelector('button');

    // 수정 버튼 클릭하기
    await user.click(editButton!);

    // onEditEvent가 호출되었는지 확인
    expect(mockOnEditEvent).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('이벤트 삭제 버튼을 누르면 onDeleteEvent가 호출되어야 한다', async () => {
    render(<EventList {...defaultProps} />);

    const user = userEvent.setup();

    // 첫 번째 이벤트의 삭제 버튼 찾기
    const deleteButton = screen.getByTestId('event-card-1').querySelectorAll('button')[1];

    // 삭제 버튼 클릭하기
    await user.click(deleteButton);

    // onDeleteEvent가 호출되었는지 확인
    expect(mockOnDeleteEvent).toHaveBeenCalledWith('1');
  });

  it('알림이 있는 이벤트는 🔔 아이콘을 보여야 한다', () => {
    render(<EventList {...defaultProps} />);

    // 첫 번째 이벤트는 알림이 있음
    const firstEventCard = screen.getByTestId('event-card-1');
    expect(firstEventCard).toHaveTextContent('🔔');

    // 두 번째 이벤트는 알림이 없음
    const secondEventCard = screen.getByTestId('event-card-2');
    expect(secondEventCard).not.toHaveTextContent('🔔');
  });

  it('여러 개의 이벤트가 있을 때 모두 표시되어야 한다', () => {
    const events = [
      createMockEvent(1, { title: '회의 A' }),
      createMockEvent(2, { title: '회의 B' }),
      createMockEvent(3, { title: '회의 C' }),
    ];

    const props = {
      ...defaultProps,
      filteredEvents: events,
    };

    render(<EventList {...props} />);

    // 모든 이벤트 카드가 보이는지 확인
    expect(screen.getByTestId('event-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('event-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('event-card-3')).toBeInTheDocument();

    // 이벤트 제목들이 모두 보이는지 확인
    expect(screen.getByText('회의 A')).toBeInTheDocument();
    expect(screen.getByText('회의 B')).toBeInTheDocument();
    expect(screen.getByText('회의 C')).toBeInTheDocument();
  });
});
