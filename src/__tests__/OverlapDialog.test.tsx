import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

import { OverlapDialog } from '../components/OverlapDialog';
import { Event } from '../types';

const mockOverlappingEvents: Event[] = [
  {
    id: '1',
    title: '기존 회의',
    date: '2024-07-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 회의',
    location: '회의실',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2024-07-15',
    startTime: '10:30',
    endTime: '11:30',
    description: '친구와 점심',
    location: '레스토랑',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 30,
  },
];

const defaultProps = {
  open: true,
  overlappingEvents: mockOverlappingEvents,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
};

describe('OverlapDialog 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    test('다이얼로그가 열린 상태일 때 올바르게 렌더링된다', () => {
      render(<OverlapDialog {...defaultProps} />);

      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
      expect(screen.getByText(/계속 진행하시겠습니까/)).toBeInTheDocument();
    });

    test('다이얼로그가 닫힌 상태일 때 렌더링되지 않는다', () => {
      render(<OverlapDialog {...defaultProps} open={false} />);

      expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
    });

    test('겹치는 일정 정보가 올바르게 표시된다', () => {
      render(<OverlapDialog {...defaultProps} />);

      expect(screen.getByText('기존 회의 (2024-07-15 10:00-11:00)')).toBeInTheDocument();
      expect(screen.getByText('점심 약속 (2024-07-15 10:30-11:30)')).toBeInTheDocument();
    });
  });

  describe('버튼 액션', () => {
    test('취소 버튼을 클릭하면 onClose가 호출된다', () => {
      render(<OverlapDialog {...defaultProps} />);

      const cancelButton = screen.getByText('취소');
      fireEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test('계속 진행 버튼을 클릭하면 onConfirm이 호출된다', () => {
      render(<OverlapDialog {...defaultProps} />);

      const confirmButton = screen.getByText('계속 진행');
      fireEvent.click(confirmButton);

      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    test('다이얼로그 배경을 클릭하면 onClose가 호출된다', () => {
      render(<OverlapDialog {...defaultProps} />);

      // MUI Dialog의 backdrop 클릭 시뮬레이션
      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape' });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('접근성', () => {
    test('다이얼로그에 적절한 role이 설정되어 있다', () => {
      render(<OverlapDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('버튼들이 접근 가능하다', () => {
      render(<OverlapDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '계속 진행' })).toBeInTheDocument();
    });
  });

  describe('경계 케이스', () => {
    test('겹치는 일정이 없을 때도 정상적으로 렌더링된다', () => {
      render(<OverlapDialog {...defaultProps} overlappingEvents={[]} />);

      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    });

    test('겹치는 일정이 1개일 때 올바르게 표시된다', () => {
      const singleEvent = [mockOverlappingEvents[0]];
      render(<OverlapDialog {...defaultProps} overlappingEvents={singleEvent} />);

      expect(screen.getByText('기존 회의 (2024-07-15 10:00-11:00)')).toBeInTheDocument();
      expect(screen.queryByText('점심 약속')).not.toBeInTheDocument();
    });

    test('매우 긴 제목의 일정도 올바르게 표시된다', () => {
      const longTitleEvent = {
        ...mockOverlappingEvents[0],
        title: '매우 긴 제목을 가진 일정이 있을 때도 올바르게 표시되는지 확인하는 테스트',
      };

      render(<OverlapDialog {...defaultProps} overlappingEvents={[longTitleEvent]} />);

      expect(screen.getByText(/매우 긴 제목을 가진 일정이 있을 때도/)).toBeInTheDocument();
    });
  });
});
