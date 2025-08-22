import { render, screen, fireEvent } from '@testing-library/react';
import { vi, test, describe, expect } from 'vitest';

import { EventOverlapDialog } from '../../components/EventOverlapDialog';

describe('EventOverlapDialog', () => {
  const overlappingEvents = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    },
  ];

  test('다이얼로그가 닫혀있으면 렌더링되지 않는다', () => {
    render(
      <EventOverlapDialog
        isOpen={false}
        overlappingEvents={overlappingEvents}
        onClose={vi.fn()}
        onContinue={vi.fn()}
      />
    );

    expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
  });

  test('다이얼로그가 열려있으면 겹치는 일정 정보가 표시된다', () => {
    render(
      <EventOverlapDialog
        isOpen={true}
        overlappingEvents={overlappingEvents}
        onClose={vi.fn()}
        onContinue={vi.fn()}
      />
    );

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-01-01 09:00-10:00)')).toBeInTheDocument();
  });

  test('취소 버튼 클릭 시 onClose가 호출된다', () => {
    const mockClose = vi.fn();

    render(
      <EventOverlapDialog
        isOpen={true}
        overlappingEvents={overlappingEvents}
        onClose={mockClose}
        onContinue={vi.fn()}
      />
    );

    const cancelButton = screen.getByRole('button', { name: '취소' });
    fireEvent.click(cancelButton);

    expect(mockClose).toHaveBeenCalled();
  });

  test('계속 진행 버튼 클릭 시 onContinue가 호출된다', () => {
    const mockContinue = vi.fn();

    render(
      <EventOverlapDialog
        isOpen={true}
        overlappingEvents={overlappingEvents}
        onClose={vi.fn()}
        onContinue={mockContinue}
      />
    );

    const continueButton = screen.getByRole('button', { name: '계속 진행' });
    fireEvent.click(continueButton);

    expect(mockContinue).toHaveBeenCalled();
  });
});
