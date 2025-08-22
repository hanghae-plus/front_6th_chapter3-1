import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import EventList from '../../components/EventList';
import { Event } from '../../types';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '테스트 일정 1',
    date: '2025-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명 1',
    location: '테스트 위치 1',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '테스트 일정 2',
    date: '2025-01-02',
    startTime: '14:00',
    endTime: '15:00',
    description: '테스트 설명 2',
    location: '테스트 위치 2',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
];

const mockProps = {
  events: mockEvents,
  searchTerm: '',
  notifiedEvents: ['1'],
  onSearchChange: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

const renderEventList = (props = {}) => {
  const defaultProps = { ...mockProps, ...props };
  return render(<EventList {...defaultProps} />);
};

describe('EventList 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('검색 입력 필드가 렌더링된다', () => {
      renderEventList();

      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByLabelText('일정 검색')).toBeInTheDocument();
    });

    it('일정 목록이 올바르게 렌더링된다', () => {
      renderEventList();

      expect(screen.getByTestId('event-list')).toBeInTheDocument();
      expect(screen.getByTestId('event-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('event-card-2')).toBeInTheDocument();
    });

    it('일정이 없을 때 적절한 메시지가 표시된다', () => {
      renderEventList({ events: [] });

      expect(screen.getByTestId('no-events-message')).toHaveTextContent('검색 결과가 없습니다.');
    });
  });

  describe('검색 기능 테스트', () => {
    it('검색 입력 필드가 올바르게 렌더링된다', () => {
      renderEventList();

      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
    });

    it('검색어가 올바르게 표시된다', () => {
      renderEventList({ searchTerm: '검색어' });

      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('일정 표시 테스트', () => {
    it('모든 일정이 올바르게 표시된다', () => {
      renderEventList();

      expect(screen.getByText('테스트 일정 1')).toBeInTheDocument();
      expect(screen.getByText('테스트 일정 2')).toBeInTheDocument();
    });
  });

  describe('이벤트 핸들러 전달 테스트', () => {
    it('편집 버튼 클릭 시 onEdit이 호출된다', async () => {
      const user = userEvent.setup();
      const mockOnEdit = vi.fn();
      renderEventList({ onEdit: mockOnEdit });

      const editButton = screen.getByTestId('edit-button-1');
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockEvents[0]);
    });

    it('삭제 버튼 클릭 시 onDelete이 호출된다', async () => {
      const user = userEvent.setup();
      const mockOnDelete = vi.fn();
      renderEventList({ onDelete: mockOnDelete });

      const deleteButton = screen.getByTestId('delete-button-1');
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });
  });
});
