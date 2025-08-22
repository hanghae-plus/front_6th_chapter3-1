import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { EventList } from '../../components/EventList';
import { Event } from '../../types';
import { renderWithProvider } from '../renderProvider';
import { createTestEvent } from '../utils';

describe('EventList 컴포넌트', () => {
  const mockEvents: Event[] = [
    createTestEvent({
      id: '1',
      title: '팀 회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
    }),
    createTestEvent({
      id: '2',
      title: '점심 약속',
      date: '2025-01-16',
      startTime: '12:00',
      endTime: '13:00',
      description: '동료와 점심',
      location: '회사 근처 식당',
      category: '개인',
      notificationTime: 60,
    }),
  ];

  const defaultProps = {
    searchTerm: '',
    setSearchTerm: vi.fn(),
    filteredEvents: mockEvents,
    notifiedEvents: ['1'],
    onEditEvent: vi.fn(),
    onDeleteEvent: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('이벤트 목록 렌더링', () => {
    it('이벤트 목록이 올바르게 렌더링된다', () => {
      renderWithProvider(<EventList {...defaultProps} />);

      expect(screen.getByTestId('event-list')).toBeInTheDocument();

      expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();

      expect(screen.getByText('팀 회의')).toBeInTheDocument();
      expect(screen.getByText('점심 약속')).toBeInTheDocument();
    });

    it('알림 시간 정보가 올바르게 표시된다', () => {
      renderWithProvider(<EventList {...defaultProps} />);

      // 알림 시간 표시 확인
      expect(screen.getByText(/알림:\s*10분 전/)).toBeInTheDocument();
      expect(screen.getByText(/알림:\s*1시간 전/)).toBeInTheDocument();
    });

    it('알림이 설정된 이벤트에 알림 아이콘이 표시된다', () => {
      renderWithProvider(<EventList {...defaultProps} />);

      const notificationIcons = screen.getAllByTestId('NotificationsIcon');
      expect(notificationIcons.length).toBe(1);
    });

    it('편집 및 삭제 버튼이 각 이벤트에 표시된다', () => {
      renderWithProvider(<EventList {...defaultProps} />);

      const editButtons = screen.getAllByLabelText('Edit event');
      expect(editButtons).toHaveLength(2);

      const deleteButtons = screen.getAllByLabelText('Delete event');
      expect(deleteButtons).toHaveLength(2);
    });
  });

  describe('검색 기능', () => {
    it('검색어 입력 시 setSearchTerm이 호출된다', () => {
      renderWithProvider(<EventList {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      fireEvent.change(searchInput, { target: { value: '팀' } });

      expect(defaultProps.setSearchTerm).toHaveBeenCalledWith('팀');
    });

    it('검색어가 설정된 경우 입력 필드에 표시된다', () => {
      const propsWithSearch = {
        ...defaultProps,
        searchTerm: '팀 회의',
      };

      renderWithProvider(<EventList {...propsWithSearch} />);

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      expect(searchInput).toHaveValue('팀 회의');
    });

    it('검색 결과가 없는 경우 안내 메시지가 표시된다', () => {
      const propsWithNoResults = {
        ...defaultProps,
        filteredEvents: [],
      };

      renderWithProvider(<EventList {...propsWithNoResults} />);

      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  describe('이벤트 액션', () => {
    it('편집 버튼 클릭 시 onEditEvent가 호출된다', () => {
      renderWithProvider(<EventList {...defaultProps} />);

      const editButtons = screen.getAllByLabelText('Edit event');
      fireEvent.click(editButtons[0]);

      expect(defaultProps.onEditEvent).toHaveBeenCalledWith(mockEvents[0]);
    });

    it('삭제 버튼 클릭 시 onDeleteEvent가 호출된다', () => {
      renderWithProvider(<EventList {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText('Delete event');
      fireEvent.click(deleteButtons[1]);

      expect(defaultProps.onDeleteEvent).toHaveBeenCalledWith(mockEvents[1].id);
    });
  });
});
