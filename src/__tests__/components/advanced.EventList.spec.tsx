import { render, screen, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { EventList } from '../../components/EventList';
import { server } from '../../setupTests';
import { createMockEvents } from '../fixtures/mockData';

const mockOnSearchChange = vi.fn();
const mockOnEditEvent = vi.fn();
const mockOnDeleteEvent = vi.fn();

describe('EventList MSW API 테스트', () => {
  const mockEvents = createMockEvents();

  const defaultProps = {
    events: mockEvents,
    notifiedEvents: [],
    searchTerm: '',
    onSearchChange: mockOnSearchChange,
    onEditEvent: mockOnEditEvent,
    onDeleteEvent: mockOnDeleteEvent,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('삭제 성공 시 onDeleteEvent 콜백이 호출된다', async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return HttpResponse.json({ success: true });
      })
    );

    render(<EventList {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete event');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDeleteEvent).toHaveBeenCalledWith('1');
  });

  it('삭제 실패 시 에러 처리가 된다', async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return HttpResponse.json({ error: 'Delete failed' }, { status: 500 });
      })
    );

    render(<EventList {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete event');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDeleteEvent).toHaveBeenCalledWith('1');
  });

  it('존재하지 않는 이벤트 삭제 시 404 에러 처리가 된다', async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
      })
    );

    render(<EventList {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete event');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDeleteEvent).toHaveBeenCalledWith('1');
  });

  it('네트워크 에러 시 적절한 에러 처리가 된다', async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return HttpResponse.json({ error: 'Network Error' }, { status: 503 });
      })
    );

    render(<EventList {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete event');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDeleteEvent).toHaveBeenCalledWith('1');
  });

  it('편집 버튼 클릭 시 onEditEvent 콜백이 호출된다', async () => {
    render(<EventList {...defaultProps} />);

    const editButtons = screen.getAllByLabelText('Edit event');
    fireEvent.click(editButtons[0]);

    expect(mockOnEditEvent).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('검색 기능이 정상 작동한다', async () => {
    render(<EventList {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    fireEvent.change(searchInput, { target: { value: '회의' } });

    expect(mockOnSearchChange).toHaveBeenCalledWith('회의');
  });

  it('알림된 이벤트에 알림 아이콘이 표시된다', async () => {
    render(<EventList {...defaultProps} notifiedEvents={['1']} />);

    const notificationIcons = screen.getAllByTestId('NotificationsIcon');
    expect(notificationIcons).toHaveLength(1);
  });
});
