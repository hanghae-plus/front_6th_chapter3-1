import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { events } from '../../__mocks__/fixture/mockEvents.json';
import { EventList } from '../../components/EventList';
import { Event } from '../../types';

const mockEvents = events as Event[];

describe('EventList', () => {
  const mockSetSearchTerm = vi.fn();
  const mockOnEditEvent = vi.fn();
  const mockOnDeleteEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('검색 기능', () => {
    it('검색어 입력 시 setSearchTerm이 호출되어야 한다', async () => {
      // Given: EventList가 렌더링된 상태
      const user = userEvent.setup();
      render(
        <EventList
          events={mockEvents}
          searchTerm=""
          setSearchTerm={mockSetSearchTerm}
          notifiedEvents={[]}
          onEditEvent={mockOnEditEvent}
          onDeleteEvent={mockOnDeleteEvent}
        />
      );

      // When: 검색 입력 필드에 텍스트를 입력하면
      const searchInput = screen.getByLabelText('일정 검색');
      await user.type(searchInput, '회의');

      // Then: setSearchTerm이 호출되어야 한다
      expect(mockSetSearchTerm).toHaveBeenCalledWith('회');
      expect(mockSetSearchTerm).toHaveBeenCalledWith('의');
    });

    it('현재 검색어가 입력 필드에 표시되어야 한다', () => {
      // Given & When: 검색어가 있는 상태로 렌더링하면
      render(
        <EventList
          events={mockEvents}
          searchTerm="회의"
          setSearchTerm={mockSetSearchTerm}
          notifiedEvents={[]}
          onEditEvent={mockOnEditEvent}
          onDeleteEvent={mockOnDeleteEvent}
        />
      );

      // Then: 검색 입력 필드에 검색어가 표시되어야 한다
      expect(screen.getByDisplayValue('회의')).toBeInTheDocument();
    });
  });

  describe('이벤트 목록 표시', () => {
    it('이벤트가 있을 때 모든 이벤트가 표시되어야 한다', () => {
      // Given & When: 이벤트 목록과 함께 렌더링하면
      render(
        <EventList
          events={mockEvents}
          searchTerm=""
          setSearchTerm={mockSetSearchTerm}
          notifiedEvents={[]}
          onEditEvent={mockOnEditEvent}
          onDeleteEvent={mockOnDeleteEvent}
        />
      );

      // Then: 모든 이벤트 제목이 표시되어야 한다
      expect(screen.getByText('면접공부')).toBeInTheDocument();
      expect(screen.getByText('회의')).toBeInTheDocument();
      expect(screen.getByText('코테풀기')).toBeInTheDocument();
    });

    it('이벤트가 없을 때 "검색 결과가 없습니다" 메시지가 표시되어야 한다', () => {
      // Given & When: 빈 이벤트 배열로 렌더링하면
      render(
        <EventList
          events={[]}
          searchTerm="없는검색어"
          setSearchTerm={mockSetSearchTerm}
          notifiedEvents={[]}
          onEditEvent={mockOnEditEvent}
          onDeleteEvent={mockOnDeleteEvent}
        />
      );

      // Then: 검색 결과 없음 메시지가 표시되어야 한다
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
      expect(screen.queryByText('팀 회의')).not.toBeInTheDocument();
    });
  });

  describe('알림 상태 표시', () => {
    it('알림된 이벤트에 알림 아이콘이 표시되어야 한다', () => {
      // Given & When: 일부 이벤트가 알림된 상태로 렌더링하면
      render(
        <EventList
          events={mockEvents}
          searchTerm=""
          setSearchTerm={mockSetSearchTerm}
          notifiedEvents={['1']}
          onEditEvent={mockOnEditEvent}
          onDeleteEvent={mockOnDeleteEvent}
        />
      );

      // Then: 알림 이벤트가 있는 경우 알림 아이콘이 표시되어야 한다
      const notificationIcons = screen.getAllByTestId('NotificationsIcon');
      expect(notificationIcons).toHaveLength(1);
    });
  });

  describe('이벤트 액션', () => {
    it('편집 버튼 클릭 시 onEditEvent가 호출되어야 한다', async () => {
      // Given: EventList가 렌더링된 상태
      const user = userEvent.setup();
      render(
        <EventList
          events={mockEvents}
          searchTerm=""
          setSearchTerm={mockSetSearchTerm}
          notifiedEvents={[]}
          onEditEvent={mockOnEditEvent}
          onDeleteEvent={mockOnDeleteEvent}
        />
      );

      // When: 첫 번째 이벤트의 편집 버튼을 클릭하면
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // Then: 해당 이벤트로 onEditEvent가 호출되어야 한다
      expect(mockOnEditEvent).toHaveBeenCalledWith(mockEvents[0]);
      expect(mockOnEditEvent).toHaveBeenCalledTimes(1);
    });

    it('삭제 버튼 클릭 시 onDeleteEvent가 호출되어야 한다', async () => {
      // Given: EventList가 렌더링된 상태
      const user = userEvent.setup();
      render(
        <EventList
          events={mockEvents}
          searchTerm=""
          setSearchTerm={mockSetSearchTerm}
          notifiedEvents={[]}
          onEditEvent={mockOnEditEvent}
          onDeleteEvent={mockOnDeleteEvent}
        />
      );

      // When: 첫 번째 이벤트의 삭제 버튼을 클릭하면
      const deleteButtons = screen.getAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      // Then: 해당 이벤트 ID로 onDeleteEvent가 호출되어야 한다
      expect(mockOnDeleteEvent).toHaveBeenCalledWith('1');
      expect(mockOnDeleteEvent).toHaveBeenCalledTimes(1);
    });
  });
});
