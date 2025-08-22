import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { OverlapDialog } from '../../components/OverlapDialog';
import type { Event } from '../../types';

describe('OverlapDialog', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

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
  ];

  const defaultProps = {
    isOpen: true,
    overlappingEvents: mockEvents,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('다이얼로그가 열렸을 때 정확히 렌더링된다', () => {
    render(<OverlapDialog {...defaultProps} />);

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText(/계속 진행하시겠습니까\?/)).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();
    expect(screen.getByText('계속 진행')).toBeInTheDocument();
  });

  it('다이얼로그가 닫힌 상태에서는 렌더링되지 않는다', () => {
    render(<OverlapDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
  });

  it('겹치는 이벤트들의 정보가 정확히 표시된다', () => {
    render(<OverlapDialog {...defaultProps} />);

    expect(screen.getByText('팀 회의 (2025-08-20 10:00-11:00)')).toBeInTheDocument();
    expect(screen.getByText('프로젝트 회의 (2025-08-20 14:00-15:00)')).toBeInTheDocument();
  });

  it('취소 버튼 클릭 시 onCancel이 호출된다', async () => {
    const user = userEvent.setup();
    render(<OverlapDialog {...defaultProps} />);

    const button = screen.getByText('취소');
    await user.click(button);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('계속 진행 버튼 클릭 시 onConfirm이 호출된다', async () => {
    const user = userEvent.setup();
    render(<OverlapDialog {...defaultProps} />);

    const button = screen.getByText('계속 진행');
    await user.click(button);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('ESC 키 누를 시 onCancel이 호출된다', async () => {
    const user = userEvent.setup();
    render(<OverlapDialog {...defaultProps} />);

    await user.keyboard('{Escape}');
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('겹치는 이벤트가 하나일 때도 올바르게 표시된다', () => {
    const singleEvent = [mockEvents[0]];
    render(<OverlapDialog {...defaultProps} overlappingEvents={singleEvent} />);

    expect(screen.getByText('팀 회의 (2025-08-20 10:00-11:00)')).toBeInTheDocument();
    expect(screen.queryByText('프로젝트 회의 (2025-08-20 14:00-15:00)')).not.toBeInTheDocument();
  });

  it('계속 진행 버튼이 에러 색상 스타일로 표시된다', () => {
    render(<OverlapDialog {...defaultProps} />);

    const button = screen.getByText('계속 진행');
    expect(button).toHaveClass('MuiButton-textError');
  });

  it('겹치는 이벤트가 없을 때도 다이얼로그가 정상적으로 작동한다', () => {
    render(<OverlapDialog {...defaultProps} overlappingEvents={[]} />);

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
  });
});
