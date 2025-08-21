import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { OverlapWarningDialog } from '../../components/OverlapWarningDialog';
import { Event } from '../../types';

const mockOverlappingEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-08-17',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '고객 미팅',
    date: '2025-08-17',
    startTime: '10:30',
    endTime: '12:00',
    description: '고객사 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  },
];

describe('OverlapWarningDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 표시 기능', () => {
    test('열린 상태일 때 경고 메시지와 겹치는 이벤트 정보가 표시되어야 한다', () => {
      // Given & When: 다이얼로그가 열린 상태로 렌더링하면
      render(
        <OverlapWarningDialog
          isOpen={true}
          overlappingEvents={mockOverlappingEvents}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 경고 메시지와 겹치는 이벤트들이 표시되어야 한다
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
      expect(screen.getByText('팀 회의 (2025-08-17 10:00-11:00)')).toBeInTheDocument();
      expect(screen.getByText('고객 미팅 (2025-08-17 10:30-12:00)')).toBeInTheDocument();
    });

    test('닫힌 상태일 때는 화면에 표시되지 않아야 한다', () => {
      // Given & When: 다이얼로그가 닫힌 상태로 렌더링하면
      render(
        <OverlapWarningDialog
          isOpen={false}
          overlappingEvents={mockOverlappingEvents}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      // Then: 다이얼로그 내용이 화면에 보이지 않아야 한다
      expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
    });
  });

  describe('사용자 액션 처리', () => {
    test('취소 버튼 클릭 시 onClose가 호출되어야 한다', () => {
      // Given: 다이얼로그가 열린 상태
      render(
        <OverlapWarningDialog
          isOpen={true}
          overlappingEvents={mockOverlappingEvents}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      // When: 취소 버튼을 클릭하면
      fireEvent.click(screen.getByText('취소'));

      // Then: onClose가 호출되어야 한다
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    test('계속 진행 버튼 클릭 시 onConfirm이 호출되어야 한다', () => {
      // Given: 다이얼로그가 열린 상태
      render(
        <OverlapWarningDialog
          isOpen={true}
          overlappingEvents={mockOverlappingEvents}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
        />
      );

      // When: 계속 진행 버튼을 클릭하면
      fireEvent.click(screen.getByText('계속 진행'));

      // Then: onConfirm이 호출되어야 한다
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
