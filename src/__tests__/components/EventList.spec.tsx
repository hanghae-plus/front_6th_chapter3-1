import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { EventList } from '../../components/EventList';
import { createMockEvent } from '../utils';

const mockProps = {
  filteredEvents: [],
  searchTerm: '',
  setSearchTerm: vi.fn(),
  notifiedEvents: [],
  onEditEvent: vi.fn(),
  onDeleteEvent: vi.fn(),
};

const renderEventList = (props = {}) => {
  return render(<EventList {...mockProps} {...props} />);
};

describe('EventList 컴포넌트', () => {
  it('검색 입력 필드가 렌더링된다', () => {
    renderEventList();
    expect(screen.getByLabelText('일정 검색')).toBeInTheDocument();
  });

  it('검색어가 없을 때 "검색 결과가 없습니다" 메시지가 표시된다', () => {
    renderEventList({ filteredEvents: [] });
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('이벤트가 있을 때 이벤트 목록이 렌더링된다', () => {
    const events = [
      createMockEvent(1, {
        title: '테스트 이벤트',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '테스트 설명',
        location: '테스트 위치',
        category: '업무',
      }),
    ];

    renderEventList({ filteredEvents: events });

    expect(screen.getByText('테스트 이벤트')).toBeInTheDocument();
    expect(screen.getByText('2025-10-01')).toBeInTheDocument();
    expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
    expect(screen.getByText('테스트 설명')).toBeInTheDocument();
    expect(screen.getByText('테스트 위치')).toBeInTheDocument();
    expect(screen.getByText('카테고리: 업무')).toBeInTheDocument();
  });

  it('검색어 입력 시 setSearchTerm이 호출된다', () => {
    const setSearchTerm = vi.fn();
    renderEventList({ setSearchTerm });

    const searchInput = screen.getByLabelText('일정 검색');
    fireEvent.change(searchInput, { target: { value: '테스트' } });

    expect(setSearchTerm).toHaveBeenCalledWith('테스트');
  });

  it('편집 버튼 클릭 시 onEditEvent가 호출된다', () => {
    const onEditEvent = vi.fn();
    const events = [createMockEvent(1)];

    renderEventList({ filteredEvents: events, onEditEvent });

    const editButton = screen.getByLabelText('Edit event');
    fireEvent.click(editButton);

    expect(onEditEvent).toHaveBeenCalledWith(events[0]);
  });

  it('삭제 버튼 클릭 시 onDeleteEvent가 호출된다', () => {
    const onDeleteEvent = vi.fn();
    const events = [createMockEvent(1)];

    renderEventList({ filteredEvents: events, onDeleteEvent });

    const deleteButton = screen.getByLabelText('Delete event');
    fireEvent.click(deleteButton);

    expect(onDeleteEvent).toHaveBeenCalledWith('1');
  });

  it('알림이 있는 이벤트가 올바르게 표시된다', () => {
    const events = [
      createMockEvent(1, {
        title: '알림 이벤트',
        notificationTime: 10,
      }),
    ];

    renderEventList({
      filteredEvents: events,
      notifiedEvents: ['1'],
    });

    expect(screen.getByText('알림 이벤트')).toBeInTheDocument();
    expect(screen.getByText('알림: 10분 전')).toBeInTheDocument();
  });

  it('반복 일정이 올바르게 표시된다', () => {
    const events = [
      createMockEvent(1, {
        title: '반복 이벤트',
        repeat: {
          type: 'weekly',
          interval: 2,
          endDate: '2025-12-31',
        },
      }),
    ];

    renderEventList({ filteredEvents: events });

    expect(screen.getByText('반복: 2주마다 (종료: 2025-12-31)')).toBeInTheDocument();
  });

  it('여러 이벤트가 올바른 순서로 렌더링된다', () => {
    const events = [
      createMockEvent(1, { title: '첫 번째 이벤트' }),
      createMockEvent(2, { title: '두 번째 이벤트' }),
      createMockEvent(3, { title: '세 번째 이벤트' }),
    ];

    renderEventList({ filteredEvents: events });

    expect(screen.getByText('첫 번째 이벤트')).toBeInTheDocument();
    expect(screen.getByText('두 번째 이벤트')).toBeInTheDocument();
    expect(screen.getByText('세 번째 이벤트')).toBeInTheDocument();
  });

  it('이벤트 카드가 렌더링된다', () => {
    const events = [createMockEvent(1, { title: '테스트 이벤트' })];
    renderEventList({ filteredEvents: events });

    expect(screen.getByText('테스트 이벤트')).toBeInTheDocument();
  });
});
