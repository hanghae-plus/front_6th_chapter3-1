import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import EventCard from '../../components/EventCard';
import { Event } from '../../types';

const mockEvent: Event = {
  id: '1',
  title: '테스트 일정',
  date: '2025-01-01',
  startTime: '09:00',
  endTime: '10:00',
  description: '테스트 설명',
  location: '테스트 위치',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

const mockEventWithRepeat: Event = {
  id: '2',
  title: '반복 일정',
  date: '2025-01-01',
  startTime: '09:00',
  endTime: '10:00',
  description: '반복 일정 설명',
  location: '반복 위치',
  category: '개인',
  repeat: { type: 'weekly', interval: 2, endDate: '2025-12-31' },
  notificationTime: 60,
};

const mockProps = {
  event: mockEvent,
  isNotified: false,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

const renderEventCard = (props = {}) => {
  const defaultProps = { ...mockProps, ...props };
  return render(<EventCard {...defaultProps} />);
};

describe('EventCard 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('일정 정보가 올바르게 표시된다', () => {
      renderEventCard();

      expect(screen.getByTestId('event-title-1')).toHaveTextContent('테스트 일정');
      expect(screen.getByTestId('event-date-1')).toHaveTextContent('2025-01-01');
      expect(screen.getByTestId('event-time-1')).toHaveTextContent('09:00 - 10:00');
      expect(screen.getByTestId('event-description-1')).toHaveTextContent('테스트 설명');
      expect(screen.getByTestId('event-location-1')).toHaveTextContent('테스트 위치');
      expect(screen.getByTestId('event-category-1')).toHaveTextContent('카테고리: 업무');
    });

    it('알림 설정이 올바르게 표시된다', () => {
      renderEventCard();

      expect(screen.getByTestId('event-notification-1')).toHaveTextContent('알림: 10분 전');
    });

    it('반복 일정 정보가 올바르게 표시된다', () => {
      renderEventCard({ event: mockEventWithRepeat });

      expect(screen.getByTestId('event-repeat-2')).toHaveTextContent(
        '반복: 2주마다 (종료: 2025-12-31)'
      );
    });

    it('반복이 없는 일정은 반복 정보를 표시하지 않는다', () => {
      renderEventCard();

      expect(screen.queryByTestId('event-repeat-1')).not.toBeInTheDocument();
    });
  });

  describe('알림 상태 테스트', () => {
    it('알림이 있는 일정은 알림 아이콘이 표시된다', () => {
      renderEventCard({ isNotified: true });

      expect(screen.getByTestId('notification-icon-1')).toBeInTheDocument();
    });

    it('알림이 없는 일정은 알림 아이콘이 표시되지 않는다', () => {
      renderEventCard({ isNotified: false });

      expect(screen.queryByTestId('notification-icon-1')).not.toBeInTheDocument();
    });

    it('알림이 있는 일정은 제목이 강조 표시된다', () => {
      renderEventCard({ isNotified: true });

      const title = screen.getByTestId('event-title-1');
      expect(title).toHaveAttribute('class');
      expect(title.className).toContain('MuiTypography-root');
    });

    it('알림이 없는 일정은 기본 스타일로 표시된다', () => {
      renderEventCard({ isNotified: false });

      const title = screen.getByTestId('event-title-1');
      expect(title).toHaveAttribute('class');
      expect(title.className).toContain('MuiTypography-root');
    });
  });

  describe('버튼 상호작용 테스트', () => {
    it('편집 버튼 클릭 시 onEdit이 호출된다', async () => {
      const user = userEvent.setup();
      const mockOnEdit = vi.fn();
      renderEventCard({ onEdit: mockOnEdit });

      const editButton = screen.getByTestId('edit-button-1');
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockEvent);
    });

    it('삭제 버튼 클릭 시 onDelete이 호출된다', async () => {
      const user = userEvent.setup();
      const mockOnDelete = vi.fn();
      renderEventCard({ onDelete: mockOnDelete });

      const deleteButton = screen.getByTestId('delete-button-1');
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('반복 일정 유형 테스트', () => {
    it('일간 반복이 올바르게 표시된다', () => {
      const dailyEvent = { ...mockEventWithRepeat, repeat: { type: 'daily', interval: 1 } };
      renderEventCard({ event: dailyEvent });

      expect(screen.getByTestId('event-repeat-2')).toHaveTextContent('반복: 1일마다');
    });

    it('월간 반복이 올바르게 표시된다', () => {
      const monthlyEvent = { ...mockEventWithRepeat, repeat: { type: 'monthly', interval: 3 } };
      renderEventCard({ event: monthlyEvent });

      expect(screen.getByTestId('event-repeat-2')).toHaveTextContent('반복: 3월마다');
    });

    it('년간 반복이 올바르게 표시된다', () => {
      const yearlyEvent = { ...mockEventWithRepeat, repeat: { type: 'yearly', interval: 1 } };
      renderEventCard({ event: yearlyEvent });

      expect(screen.getByTestId('event-repeat-2')).toHaveTextContent('반복: 1년마다');
    });
  });
});
