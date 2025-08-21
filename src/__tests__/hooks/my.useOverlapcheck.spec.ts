import { act, renderHook } from '@testing-library/react';

import { useOverlapCheck } from '../../hooks/useOverlapCheck.ts';
import { EventForm, RepeatType } from '../../types';

describe('useOverlapCheck', () => {
  it('event가 없을 때 중복 검사 결과는 false', () => {
    const { result } = renderHook(() => useOverlapCheck());

    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('should check for overlap and return result', () => {
    const { result } = renderHook(() => useOverlapCheck());
    const mockEvents = [
      {
        id: '1',
        title: '기존 이벤트',
        date: '2024-01-01',
        startTime: '10:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: 'work',
        repeat: { type: 'none' as RepeatType, interval: 1, endDate: undefined },
        notificationTime: 5,
      },
    ];

    const newEvent: EventForm = {
      title: '새 이벤트',
      date: '2024-01-01',
      startTime: '11:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: 'work',
      repeat: { type: 'none' as RepeatType, interval: 1, endDate: undefined },
      notificationTime: 5,
    };

    act(() => {
      result.current.checkForOverlap(newEvent, mockEvents);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);
  });
});
