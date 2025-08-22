import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import OverlapDialog from '../../components/OverlapDialog';
import { Event } from '../../types';

const mockOverlappingEvents: Event[] = [
  {
    id: '1',
    title: '겹치는 일정 1',
    date: '2025-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '겹치는 일정 설명 1',
    location: '겹치는 위치 1',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '겹치는 일정 2',
    date: '2025-01-01',
    startTime: '09:30',
    endTime: '10:30',
    description: '겹치는 일정 설명 2',
    location: '겹치는 위치 2',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
];

const mockProps = {
  open: true,
  overlappingEvents: mockOverlappingEvents,
  onClose: vi.fn(),
  onContinue: vi.fn(),
};

const renderOverlapDialog = (props = {}) => {
  const defaultProps = { ...mockProps, ...props };
  return render(<OverlapDialog {...defaultProps} />);
};

describe('OverlapDialog 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('다이얼로그가 열려있을 때 올바르게 렌더링된다', () => {
      renderOverlapDialog();

      expect(screen.getByTestId('overlap-dialog-title')).toHaveTextContent('일정 겹침 경고');
      expect(screen.getByTestId('overlap-dialog-content')).toBeInTheDocument();
    });

    it('겹치는 일정 목록이 올바르게 표시된다', () => {
      renderOverlapDialog();

      expect(screen.getByTestId('overlap-event-1')).toHaveTextContent(
        '겹치는 일정 1 (2025-01-01 09:00-10:00)'
      );
      expect(screen.getByTestId('overlap-event-2')).toHaveTextContent(
        '겹치는 일정 2 (2025-01-01 09:30-10:30)'
      );
    });

    it('취소와 계속 진행 버튼이 올바르게 렌더링된다', () => {
      renderOverlapDialog();

      expect(screen.getByTestId('overlap-dialog-cancel')).toHaveTextContent('취소');
      expect(screen.getByTestId('overlap-dialog-continue')).toHaveTextContent('계속 진행');
    });
  });

  describe('상호작용 테스트', () => {
    it('취소 버튼 클릭 시 onClose가 호출된다', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      renderOverlapDialog({ onClose: mockOnClose });

      const cancelButton = screen.getByTestId('overlap-dialog-cancel');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('계속 진행 버튼 클릭 시 onContinue가 호출된다', async () => {
      const user = userEvent.setup();
      const mockOnContinue = vi.fn();
      renderOverlapDialog({ onContinue: mockOnContinue });

      const continueButton = screen.getByTestId('overlap-dialog-continue');
      await user.click(continueButton);

      expect(mockOnContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe('상태 테스트', () => {
    it('다이얼로그가 닫혀있을 때는 렌더링되지 않는다', () => {
      renderOverlapDialog({ open: false });

      expect(screen.queryByTestId('overlap-dialog-title')).not.toBeInTheDocument();
    });

    it('겹치는 일정이 없을 때도 올바르게 렌더링된다', () => {
      renderOverlapDialog({ overlappingEvents: [] });

      expect(screen.getByTestId('overlap-dialog-title')).toBeInTheDocument();
      expect(screen.getByTestId('overlap-dialog-content')).toBeInTheDocument();
    });
  });
});
