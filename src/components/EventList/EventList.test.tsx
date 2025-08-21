import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { EventList } from './EventList';
import { Event } from '../../types';

// EventListItem만 mock 처리해서 UI 단순화
vi.mock('./EventListItem', () => ({
  EventListItem: ({ event, isNotified }: { event: Event; isNotified: boolean }) => (
    <div data-testid="event-list-item">
      {event.title} {isNotified && '🔔'}
    </div>
  ),
}));

describe('<EventList /> (UI only)', () => {
  const baseEvent: Event = {
    id: '1',
    title: '팀 회의',
    date: '2025-10-02',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const notificationOptions = [
    { value: 10, label: '10분 전' },
    { value: 30, label: '30분 전' },
  ];

  it('검색 input이 렌더링되고 초기 searchTerm이 보인다', () => {
    render(
      <EventList
        filteredEvents={[]}
        notifiedEvents={[]}
        notificationOptions={notificationOptions}
        searchTerm="회의"
        onSearchChange={vi.fn()}
        onEditEvent={vi.fn()}
        onDeleteEvent={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('회의'); // UI에 searchTerm 표시 여부 확인
  });

  it('filteredEvents가 있으면 EventListItem이 렌더링된다', () => {
    render(
      <EventList
        filteredEvents={[baseEvent]}
        notifiedEvents={['1']}
        notificationOptions={notificationOptions}
        searchTerm=""
        onSearchChange={vi.fn()}
        onEditEvent={vi.fn()}
        onDeleteEvent={vi.fn()}
      />
    );

    const items = screen.getAllByTestId('event-list-item');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('팀 회의');
    expect(items[0]).toHaveTextContent('🔔'); // 알림 표시 UI 확인
  });

  it('filteredEvents가 없으면 안내 메시지가 표시된다', () => {
    render(
      <EventList
        filteredEvents={[]}
        notifiedEvents={[]}
        notificationOptions={notificationOptions}
        searchTerm=""
        onSearchChange={vi.fn()}
        onEditEvent={vi.fn()}
        onDeleteEvent={vi.fn()}
      />
    );

    expect(screen.getByText(/검색 결과가 없습니다/)).toBeInTheDocument();
  });
});
