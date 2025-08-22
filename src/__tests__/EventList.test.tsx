import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import { EventList } from '../components/EventList';
import { Event } from '../types';
import { createMockEvents } from './fixtures/mockData';

const mockEvents: Event[] = createMockEvents();

const defaultProps = {
  events: mockEvents,
  notifiedEvents: [],
  searchTerm: '',
  onSearchChange: vi.fn(),
  onEditEvent: vi.fn(),
  onDeleteEvent: vi.fn(),
};

describe('EventList 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    test('이벤트 목록이 올바르게 렌더링된다', () => {
      render(<EventList {...defaultProps} />);

      expect(screen.getByTestId('event-list')).toBeInTheDocument();
      expect(screen.getByLabelText('일정 검색')).toBeInTheDocument();
    });

    test('모든 이벤트가 표시된다', () => {
      render(<EventList {...defaultProps} />);

      expect(screen.getByText('회의')).toBeInTheDocument();
      expect(screen.getByText('점심 약속')).toBeInTheDocument();
    });

    test('이벤트 상세 정보가 표시된다', () => {
      render(<EventList {...defaultProps} />);

      // 첫 번째 이벤트 정보
      expect(screen.getByText('2024-07-15')).toBeInTheDocument();
      expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
      expect(screen.getByText('팀 회의')).toBeInTheDocument();
      expect(screen.getByText('회의실')).toBeInTheDocument();
      expect(screen.getByText('카테고리: 업무')).toBeInTheDocument();
    });
  });

  describe('검색 기능', () => {
    test('검색 입력 필드가 올바르게 작동한다', () => {
      render(<EventList {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      fireEvent.change(searchInput, { target: { value: '회의' } });

      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('회의');
    });

    test('검색어가 표시된다', () => {
      render(<EventList {...defaultProps} searchTerm="회의" />);

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
      expect(searchInput).toHaveValue('회의');
    });
  });

  describe('이벤트 액션', () => {
    test('편집 버튼이 올바르게 작동한다', () => {
      render(<EventList {...defaultProps} />);

      const editButtons = screen.getAllByLabelText('Edit event');
      fireEvent.click(editButtons[0]);

      expect(defaultProps.onEditEvent).toHaveBeenCalledWith(mockEvents[0]);
    });

    test('삭제 버튼이 올바르게 작동한다', () => {
      render(<EventList {...defaultProps} />);

      const deleteButtons = screen.getAllByLabelText('Delete event');
      fireEvent.click(deleteButtons[0]);

      expect(defaultProps.onDeleteEvent).toHaveBeenCalledWith('1');
    });
  });

  describe('알림 상태', () => {
    test('알림된 이벤트가 특별한 스타일로 표시된다', () => {
      render(<EventList {...defaultProps} notifiedEvents={['1']} />);

      const eventTitle = screen.getByText('회의');
      expect(eventTitle).toBeInTheDocument();
    });

    test('알림된 이벤트에 알림 아이콘이 표시된다', () => {
      render(<EventList {...defaultProps} notifiedEvents={['1']} />);

      const notificationIcons = screen.getAllByTestId('NotificationsIcon');
      expect(notificationIcons).toHaveLength(1);
    });

    test('알림되지 않은 이벤트는 기본 스타일로 표시된다', () => {
      render(<EventList {...defaultProps} />);

      const eventTitle = screen.getByText('회의');
      expect(eventTitle).toBeInTheDocument();
    });
  });

  describe('반복 일정 표시', () => {
    test('반복 일정 정보가 올바르게 표시된다', () => {
      render(<EventList {...defaultProps} />);

      expect(screen.getByText('반복: 1주마다 (종료: 2024-12-31)')).toBeInTheDocument();
    });

    test('반복하지 않는 일정은 반복 정보가 표시되지 않는다', () => {
      const nonRepeatEvents = [mockEvents[0]]; // 첫 번째 이벤트만 (반복 없음)
      render(<EventList {...defaultProps} events={nonRepeatEvents} />);

      expect(screen.queryByText(/반복:/)).not.toBeInTheDocument();
    });
  });

  describe('알림 시간 표시', () => {
    test('알림 시간이 올바르게 표시된다', () => {
      render(<EventList {...defaultProps} />);

      expect(screen.getByText('알림: 10분 전')).toBeInTheDocument();
      expect(screen.getByText('알림: 1시간 전')).toBeInTheDocument();
    });
  });

  describe('빈 상태', () => {
    test('이벤트가 없을 때 적절한 메시지가 표시된다', () => {
      render(<EventList {...defaultProps} events={[]} />);

      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    test('편집 및 삭제 버튼에 적절한 aria-label이 있다', () => {
      render(<EventList {...defaultProps} />);

      expect(screen.getAllByLabelText('Edit event')).toHaveLength(2);
      expect(screen.getAllByLabelText('Delete event')).toHaveLength(2);
    });

    test('검색 입력 필드에 적절한 레이블이 있다', () => {
      render(<EventList {...defaultProps} />);

      expect(screen.getByLabelText('일정 검색')).toBeInTheDocument();
    });
  });
});
