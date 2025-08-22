import React from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { OverlapDialog } from '../../components/event/OverlapDialog';
import { Event } from '../../types';

// Mock Material-UI components if needed
vi.mock('@mui/material', () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Dialog: ({
    children,
    open,
    ...props
  }: {
    children: React.ReactNode;
    open: boolean;
    [key: string]: unknown;
  }) =>
    open ? (
      <div role="dialog" {...props}>
        {children}
      </div>
    ) : null,
  DialogActions: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <div {...props}>{children}</div>,
  DialogContent: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <div {...props}>{children}</div>,
  DialogContentText: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <div {...props}>{children}</div>,
  DialogTitle: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
  Typography: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
}));

describe('OverlapDialog', () => {
  const mockOverlappingEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '다른 회의',
      date: '2025-10-01',
      startTime: '09:30',
      endTime: '10:30',
      description: '다른 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    },
  ];

  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('다이얼로그가 열려있을 때 겹치는 일정 정보를 표시한다', () => {
    render(
      <OverlapDialog
        open={true}
        overlappingEvents={mockOverlappingEvents}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();
    expect(screen.getByText('계속 진행')).toBeInTheDocument();

    // 겹치는 일정이 렌더링되었는지 확인 (더 유연한 방식)
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('기존 회의');
    expect(dialog).toHaveTextContent('다른 회의');
    expect(dialog).toHaveTextContent('2025-10-01');
  });

  it('다이얼로그가 닫혀있을 때는 아무것도 렌더링하지 않는다', () => {
    render(
      <OverlapDialog
        open={false}
        overlappingEvents={mockOverlappingEvents}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
  });

  it('취소 버튼을 클릭하면 onClose가 호출된다', async () => {
    const user = userEvent.setup();

    render(
      <OverlapDialog
        open={true}
        overlappingEvents={mockOverlappingEvents}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByText('취소');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('계속 진행 버튼을 클릭하면 onConfirm이 호출된다', async () => {
    const user = userEvent.setup();

    render(
      <OverlapDialog
        open={true}
        overlappingEvents={mockOverlappingEvents}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const confirmButton = screen.getByText('계속 진행');
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('겹치는 일정이 없을 때도 다이얼로그가 정상적으로 렌더링된다', () => {
    render(
      <OverlapDialog
        open={true}
        overlappingEvents={[]}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();
    expect(screen.getByText('계속 진행')).toBeInTheDocument();
  });
});
