import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EventList } from '../../components/EventList';
import { Event } from '../../types';
import { createTestEvents } from '../utils';

const mockEvents: Event[] = createTestEvents([
  {
    id: '1',
    title: '팀 회의',
    date: '2025-08-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-08-02',
    startTime: '12:00',
    endTime: '13:00',
    description: '동료와 점심',
    location: '레스토랑',
    category: '개인',
  },
]);

const mockProps = {
  filteredEvents: mockEvents,
  notifiedEvents: [],
  searchTerm: '',
  setSearchTerm: vi.fn(),
  editEvent: vi.fn(),
  deleteEvent: vi.fn(),
};

describe('EventList 컴포넌트', () => {
  describe('기본 렌더링', () => {
    it('이벤트 리스트 컨테이너가 올바르게 렌더링된다', () => {
      render(<EventList {...mockProps} />);

      const eventList = screen.getByTestId('event-list');
      expect(eventList).toBeInTheDocument();
    });

    it('검색 입력 필드가 올바르게 렌더링된다', () => {
      render(<EventList {...mockProps} />);

      const searchInput = screen.getByLabelText('일정 검색');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', '검색어를 입력하세요');
    });

    it('검색 입력 필드에 현재 searchTerm 값이 표시된다', () => {
      const propsWithSearchTerm = { ...mockProps, searchTerm: '테스트 검색어' };
      render(<EventList {...propsWithSearchTerm} />);

      const searchInput = screen.getByLabelText('일정 검색');
      expect(searchInput).toHaveValue('테스트 검색어');
    });
  });

  describe('일정 목록 표시', () => {
    it('일정이 있을 때 모든 일정이 목록에 표시된다', () => {
      render(<EventList {...mockProps} />);

      expect(screen.getByText('팀 회의')).toBeInTheDocument();
      expect(screen.getByText('점심 약속')).toBeInTheDocument();
    });

    it('일정이 없을 때 "검색 결과가 없습니다." 메시지가 표시된다', () => {
      const propsWithNoEvents = { ...mockProps, filteredEvents: [] };
      render(<EventList {...propsWithNoEvents} />);

      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    it('각 일정의 기본 정보(제목, 날짜, 시간)가 표시된다', () => {
      render(<EventList {...mockProps} />);

      expect(screen.getByText('팀 회의')).toBeInTheDocument();
      expect(screen.getByText('2025-08-01')).toBeInTheDocument();
      expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();

      expect(screen.getByText('점심 약속')).toBeInTheDocument();
      expect(screen.getByText('2025-08-02')).toBeInTheDocument();
      expect(screen.getByText('12:00 - 13:00')).toBeInTheDocument();
    });

    it('각 일정의 세부 정보(설명, 위치, 카테고리)가 표시된다', () => {
      render(<EventList {...mockProps} />);

      expect(screen.getByText('주간 팀 미팅')).toBeInTheDocument();
      expect(screen.getByText('회의실 A')).toBeInTheDocument();
      expect(screen.getByText('카테고리: 업무')).toBeInTheDocument();

      expect(screen.getByText('동료와 점심')).toBeInTheDocument();
      expect(screen.getByText('레스토랑')).toBeInTheDocument();
      expect(screen.getByText('카테고리: 개인')).toBeInTheDocument();
    });
  });

  describe('반복 일정 표시', () => {
    it('반복 일정이 아닐 때 반복 정보가 표시되지 않는다', () => {
      render(<EventList {...mockProps} />);

      expect(screen.queryByText(/반복:/)).not.toBeInTheDocument();
    });

    it('반복 일정일 때 반복 정보가 올바르게 표시된다', () => {
      const repeatEvents = createTestEvents([
        {
          id: '3',
          title: '주간 회의',
          date: '2025-08-01',
          repeat: { type: 'weekly', interval: 1 },
        },
      ]);
      const propsWithRepeatEvent = { ...mockProps, filteredEvents: repeatEvents };

      render(<EventList {...propsWithRepeatEvent} />);

      expect(screen.getByText('반복: 1주마다')).toBeInTheDocument();
    });

    it('반복 종료 날짜가 있을 때 종료 날짜가 표시된다', () => {
      const repeatEventsWithEndDate = createTestEvents([
        {
          id: '4',
          title: '일간 운동',
          date: '2025-08-01',
          repeat: { type: 'daily', interval: 1, endDate: '2025-12-31' },
        },
      ]);
      const propsWithEndDate = { ...mockProps, filteredEvents: repeatEventsWithEndDate };

      render(<EventList {...propsWithEndDate} />);

      expect(screen.getByText('반복: 1일마다 (종료: 2025-12-31)')).toBeInTheDocument();
    });
  });

  describe('알림 기능', () => {
    it('알림을 받지 않은 일정에는 알림 아이콘이 표시되지 않는다', () => {
      render(<EventList {...mockProps} />);

      const notificationIcons = screen.queryAllByTestId('NotificationsIcon');
      expect(notificationIcons).toHaveLength(0);
    });

    it('알림을 받은 일정에 알림 아이콘이 표시된다', () => {
      const propsWithNotification = { ...mockProps, notifiedEvents: ['1'] };
      render(<EventList {...propsWithNotification} />);

      const notificationIcons = screen.getAllByTestId('NotificationsIcon');
      expect(notificationIcons).toHaveLength(1);
    });
  });

  describe('일정 조작 기능', () => {
    it('각 일정에 수정/삭제 버튼이 표시된다', () => {
      render(<EventList {...mockProps} />);

      const editButtons = screen.getAllByLabelText('Edit event');
      const deleteButtons = screen.getAllByLabelText('Delete event');

      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
    });

    it('수정 버튼 클릭 시 editEvent가 호출된다', async () => {
      const user = userEvent.setup();
      render(<EventList {...mockProps} />);

      const editButton = screen.getAllByLabelText('Edit event')[0];
      await user.click(editButton);

      expect(mockProps.editEvent).toHaveBeenCalledWith(mockEvents[0]);
    });

    it('삭제 버튼 클릭 시 deleteEvent가 호출된다', async () => {
      const user = userEvent.setup();
      render(<EventList {...mockProps} />);

      const deleteButton = screen.getAllByLabelText('Delete event')[0];
      await user.click(deleteButton);

      expect(mockProps.deleteEvent).toHaveBeenCalledWith(mockEvents[0].id);
    });
  });

  describe('알림 시간 표시', () => {
    it('알림 시간이 올바른 형식으로 표시된다', () => {
      const eventsWithNotificationTime = createTestEvents([
        {
          id: '5',
          title: '알림 테스트',
          date: '2025-08-01',
          notificationTime: 10,
        },
      ]);
      const propsWithNotificationTime = {
        ...mockProps,
        filteredEvents: eventsWithNotificationTime,
      };

      render(<EventList {...propsWithNotificationTime} />);

      expect(screen.getByText('알림: 10분 전')).toBeInTheDocument();
    });
  });

  describe('검색 입력 상호작용', () => {
    it('검색어 입력 시 setSearchTerm이 호출된다', async () => {
      const user = userEvent.setup();
      render(<EventList {...mockProps} />);

      const searchInput = screen.getByLabelText('일정 검색');
      await user.type(searchInput, '회의');

      expect(mockProps.setSearchTerm).toHaveBeenLastCalledWith('의');
      expect(mockProps.setSearchTerm).toHaveBeenCalledTimes(2);
    });
  });
});
