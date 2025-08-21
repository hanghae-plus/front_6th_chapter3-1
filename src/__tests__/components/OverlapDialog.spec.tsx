import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { OverlapDialog } from '../../components/dialog/OverlapDialog';
import { Event } from '../../types';

describe('OverlapDialog', () => {
  const mockOverlappingEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '중요한 미팅',
      date: '2025-01-15',
      startTime: '09:30',
      endTime: '11:00',
      description: '중요한 클라이언트 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
  ];

  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
  });

  it('다이얼로그가 열려있지 않을 때 렌더링되지 않는다', () => {
    render(
      <OverlapDialog
        isOpen={false}
        overlappingEvents={mockOverlappingEvents}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
  });

  it('다이얼로그가 열려있을 때 제목과 내용이 표시된다', () => {
    render(
      <OverlapDialog
        isOpen={true}
        overlappingEvents={mockOverlappingEvents}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다:/)).toBeInTheDocument();
    expect(screen.getByText(/계속 진행하시겠습니까?/)).toBeInTheDocument();
  });

  it('겹치는 일정들의 정보가 모두 표시된다', () => {
    render(
      <OverlapDialog
        isOpen={true}
        overlappingEvents={mockOverlappingEvents}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('기존 회의 (2025-01-15 09:00-10:00)')).toBeInTheDocument();
    expect(screen.getByText('중요한 미팅 (2025-01-15 09:30-11:00)')).toBeInTheDocument();
  });

  it('취소 버튼을 클릭하면 onClose가 호출된다', async () => {
    const user = userEvent.setup();

    render(
      <OverlapDialog
        isOpen={true}
        overlappingEvents={mockOverlappingEvents}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByText('취소');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('계속 진행 버튼을 클릭하면 onConfirm이 호출된다', async () => {
    const user = userEvent.setup();

    render(
      <OverlapDialog
        isOpen={true}
        overlappingEvents={mockOverlappingEvents}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const confirmButton = screen.getByText('계속 진행');
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
