import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { OverlapDialog } from '../../components/OverlapDialog';
import { Event } from '../../types';
import { renderWithProvider } from '../renderProvider';
import { createTestEvent } from '../utils';

describe('OverlapDialog 컴포넌트', () => {
  const mockOverlappingEvents: Event[] = [
    createTestEvent({
      id: '1',
      title: '기존 회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
    }),
    createTestEvent({
      id: '2',
      title: '중요한 미팅',
      date: '2025-01-15',
      startTime: '10:30',
      endTime: '11:30',
    }),
  ];

  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    overlappingEvents: mockOverlappingEvents,
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('다이얼로그 렌더링', () => {
    it('다이얼로그가 열린 상태에서 올바르게 렌더링된다', () => {
      renderWithProvider(<OverlapDialog {...defaultProps} />);

      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      expect(screen.getByText('다음 일정과 겹칩니다:')).toBeInTheDocument();

      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '계속 진행' })).toBeInTheDocument();
    });

    it('다이얼로그가 닫힌 상태에서는 렌더링되지 않는다', () => {
      const closedProps = {
        ...defaultProps,
        open: false,
      };

      renderWithProvider(<OverlapDialog {...closedProps} />);

      expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
    });

    it('겹치는 이벤트들이 올바르게 표시된다', () => {
      renderWithProvider(<OverlapDialog {...defaultProps} />);

      // 겹치는 이벤트 정보 확인
      expect(screen.getByText(/기존 회의/)).toBeInTheDocument();
      expect(screen.getByText(/2025-01-15 10:00-11:00/)).toBeInTheDocument();

      expect(screen.getByText(/중요한 미팅/)).toBeInTheDocument();
      expect(screen.getByText(/2025-01-15 10:30-11:30/)).toBeInTheDocument();
    });
  });

  describe('사용자 상호작용', () => {
    it('취소 버튼 클릭 시 onClose가 호출된다', () => {
      renderWithProvider(<OverlapDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: '취소' });
      fireEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    });

    it('계속 진행 버튼 클릭 시 onConfirm이 호출된다', () => {
      renderWithProvider(<OverlapDialog {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: '계속 진행' });
      fireEvent.click(confirmButton);

      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });
  });
});
