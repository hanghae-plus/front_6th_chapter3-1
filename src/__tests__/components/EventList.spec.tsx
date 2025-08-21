import { render, screen, fireEvent } from '@testing-library/react';

import { EventList } from '../../components/EventList';
import { createMockEvent } from '../utils';

describe('EventList', () => {
  it('이벤트가 없을 때 "검색 결과가 없습니다" 메시지를 표시한다', () => {
    const mockProps = {
      filteredEvents: [],
      notifiedEvents: [],
      editEvent: vi.fn(),
      deleteEvent: vi.fn(),
    };

    render(<EventList {...mockProps} />);

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('이벤트 리스트를 렌더링한다', () => {
    const mockProps = {
      filteredEvents: [
        createMockEvent(1, {
          title: '테스트 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '중요한 회의',
          location: '회의실 A',
          category: '업무',
          notificationTime: 10,
        }),
      ],
      notifiedEvents: [],
      editEvent: vi.fn(),
      deleteEvent: vi.fn(),
    };

    render(<EventList {...mockProps} />);

    expect(screen.getByText('테스트 회의')).toBeInTheDocument();
    expect(screen.getByText('2025-10-15')).toBeInTheDocument();
    expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
    expect(screen.getByText('중요한 회의')).toBeInTheDocument();
    expect(screen.getByText('회의실 A')).toBeInTheDocument();
    expect(screen.getByText('카테고리: 업무')).toBeInTheDocument();
    expect(screen.getByText('알림: 10분 전')).toBeInTheDocument();
  });

  it('편집 버튼 클릭 시 editEvent가 호출된다', () => {
    const mockEditEvent = vi.fn();
    const mockEvent = createMockEvent(1);

    const mockProps = {
      filteredEvents: [mockEvent],
      notifiedEvents: [],
      editEvent: mockEditEvent,
      deleteEvent: vi.fn(),
    };

    render(<EventList {...mockProps} />);

    fireEvent.click(screen.getByLabelText('Edit event'));

    expect(mockEditEvent).toHaveBeenCalledTimes(1);
    expect(mockEditEvent).toHaveBeenCalledWith(mockEvent);
  });

  it('삭제 버튼 클릭 시 deleteEvent가 호출된다', () => {
    const mockDeleteEvent = vi.fn();
    const mockEvent = createMockEvent(1);

    const mockProps = {
      filteredEvents: [mockEvent],
      notifiedEvents: [],
      editEvent: vi.fn(),
      deleteEvent: mockDeleteEvent,
    };

    render(<EventList {...mockProps} />);

    fireEvent.click(screen.getByLabelText('Delete event'));

    expect(mockDeleteEvent).toHaveBeenCalledTimes(1);
    expect(mockDeleteEvent).toHaveBeenCalledWith(mockEvent.id);
  });
});
