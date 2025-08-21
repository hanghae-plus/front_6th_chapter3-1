import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { EventList } from '../../components/EventList';
import type { Event } from '../../types';

describe('EventList', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSearchChange = vi.fn();

  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-08-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '2',
      title: '프로젝트 회의',
      date: '2025-08-20',
      startTime: '14:00',
      endTime: '15:00',
      description: '주간 프로젝트 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '점심 팀회식',
      date: '2025-08-24',
      startTime: '12:00',
      endTime: '13:00',
      description: '분기 팀 회식',
      location: '강동화로',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const defaultProps = {
    events: mockEvents,
    searchTerm: '',
    notifiedEvents: ['1'],
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onSearchChange: mockOnSearchChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('이벤트 리스트가 정확히 렌더링된다', () => {
    render(<EventList {...defaultProps} />);

    expect(screen.getByTestId('event-list')).toBeInTheDocument();
    expect(screen.getByLabelText('일정 검색')).toBeInTheDocument();
    expect(screen.getByText('팀 회의')).toBeInTheDocument();
    expect(screen.getByText('프로젝트 회의')).toBeInTheDocument();
  });

  it('검색 입력 시 onSearchChange가 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventList {...defaultProps} />);

    const input = screen.getByLabelText('일정 검색');
    await user.clear(input);
    await user.type(input, '회의');

    expect(mockOnSearchChange).toHaveBeenCalledTimes(2);
  });

  it('이벤트가 없을 때 검색 결과가 없다는 메시지가 표시된다', () => {
    render(<EventList {...defaultProps} events={[]} />);

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('각 이벤트의 상세 정보가 정확히 표시된다', () => {
    render(<EventList {...defaultProps} />);

    expect(screen.getByText('팀 회의')).toBeInTheDocument();
    expect(screen.getAllByText('2025-08-20')[0]).toBeInTheDocument();
    expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument();
    expect(screen.getByText('주간 팀 미팅')).toBeInTheDocument();
    expect(screen.getByText('회의실 A')).toBeInTheDocument();
    expect(screen.getAllByText('카테고리: 업무')[0]).toBeInTheDocument();
    expect(screen.getByText('알림: 1분 전')).toBeInTheDocument();
  });

  it('반복이 없는 일정에는 반복 정보가 표시되지 않는다', () => {
    render(<EventList {...defaultProps} />);

    const event = screen.getByText('점심 팀회식');
    expect(event).not.toHaveTextContent('반복:');
  });

  it('알림이 설정된 이벤트에 알림 아이콘이 표시된다', () => {
    render(<EventList {...defaultProps} />);

    const event = screen.getByText('팀 회의').closest('[class*="MuiStack"]');
    expect(event?.querySelector('[data-testid="NotificationsIcon"]')).toBeInTheDocument();
  });

  it('알림이 설정된 이벤트 제목이 굵게 표시되고 색상이 변경된다', () => {
    render(<EventList {...defaultProps} />);

    const title = screen.getByText('팀 회의');
    expect(title).toHaveStyle('font-weight: 700');
  });

  it('알림이 설정되지 않은 이벤트는 기본 스타일이 적용된다', () => {
    render(<EventList {...defaultProps} />);

    const title = screen.getByText('점심 팀회식');
    expect(title).toHaveStyle('font-weight: normal');
  });

  it('편집 버튼 클릭 시 onEdit이 해당 이벤트로 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventList {...defaultProps} />);

    const editButtons = screen.getAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('삭제 버튼 클릭 시 onDelete가 해당 이벤트 ID로 호출된다', async () => {
    const user = userEvent.setup();
    render(<EventList {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('검색어가 표시된 상태에서 올바른 값이 입력창에 나타난다', () => {
    render(<EventList {...defaultProps} searchTerm="회의" />);

    const searchInput = screen.getByLabelText('일정 검색') as HTMLInputElement;
    expect(searchInput.value).toBe('회의');
  });

  it('알림 시간이 올바른 형식으로 표시된다', () => {
    render(<EventList {...defaultProps} />);

    expect(screen.getByText('알림: 1분 전')).toBeInTheDocument();
    expect(screen.getAllByText('알림: 10분 전')[0]).toBeInTheDocument();
  });
});
