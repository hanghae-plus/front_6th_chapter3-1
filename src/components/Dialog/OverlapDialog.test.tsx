import { render, screen } from '@testing-library/react';
import OverlapDialog from './OverlapDialog';
import { Event } from '../../types';

describe('OverlapDialog', () => {
  it('겹치는 이벤트 정보가 올바르게 표시됨', () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-01-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    render(
      <OverlapDialog
        open={true}
        overlappingEvents={mockEvents}
        onClose={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(screen.getByText('기존 회의 (2024-01-01 10:00-11:00)')).toBeInTheDocument();
  });
});
