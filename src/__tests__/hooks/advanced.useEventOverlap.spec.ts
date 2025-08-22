import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useEventOverlap } from '../../hooks/useEventOverlap';
import { findOverlappingEvents } from '../../utils/eventOverlap';
import { createEvent } from '../utils';

// findOverlappingEvents 모킹
vi.mock('../../utils/eventOverlap', () => ({
  findOverlappingEvents: vi.fn(),
}));

describe('useEventOverlap', () => {
  let mockOnSave: ReturnType<typeof vi.fn>;
  let mockOnReset: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSave = vi.fn();
    mockOnReset = vi.fn();
    vi.clearAllMocks();
  });

  it('초기 상태가 올바르게 설정되어야 한다', () => {
    const { result } = renderHook(() => useEventOverlap());

    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('중복 이벤트가 없을 때 onSave와 onReset을 호출해야 한다', async () => {
    const { result } = renderHook(() => useEventOverlap());
    const eventData = createEvent({ date: '2025-01-01', startTime: '09:00', endTime: '10:00' });
    const events = [createEvent({ date: '2025-01-02', startTime: '09:00', endTime: '10:00' })];

    // 중복 없음 모킹
    vi.mocked(findOverlappingEvents).mockReturnValue([]);

    await act(async () => {
      const hasOverlap = await result.current.checkAndHandleOverlap(
        eventData,
        events,
        mockOnSave,
        mockOnReset
      );
      expect(hasOverlap).toBe(false);
    });

    expect(mockOnSave).toHaveBeenCalledWith(eventData);
    expect(mockOnReset).toHaveBeenCalled();
    expect(result.current.isOverlapDialogOpen).toBe(false);
  });

  it('중복 이벤트가 있을 때 다이얼로그를 열고 중복 이벤트를 설정해야 한다', async () => {
    const { result } = renderHook(() => useEventOverlap());
    const eventData = createEvent({ date: '2025-01-01', startTime: '09:00', endTime: '10:00' });
    const overlappingEvent = createEvent({
      date: '2025-01-01',
      startTime: '09:30',
      endTime: '10:30',
    });
    const events = [overlappingEvent];

    // 중복 있음 모킹
    vi.mocked(findOverlappingEvents).mockReturnValue([overlappingEvent]);

    await act(async () => {
      const hasOverlap = await result.current.checkAndHandleOverlap(
        eventData,
        events,
        mockOnSave,
        mockOnReset
      );
      expect(hasOverlap).toBe(true);
    });

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockOnReset).not.toHaveBeenCalled();
    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual([overlappingEvent]);
  });

  it('closeOverlapDialog가 다이얼로그를 닫아야 한다', async () => {
    const { result } = renderHook(() => useEventOverlap());
    const eventData = createEvent({ date: '2025-01-01', startTime: '09:00', endTime: '10:00' });
    const overlappingEvent = createEvent({
      date: '2025-01-01',
      startTime: '09:30',
      endTime: '10:30',
    });
    const events = [overlappingEvent];

    // 먼저 다이얼로그를 열기 위해 중복 이벤트가 있는 상황을 만듦
    vi.mocked(findOverlappingEvents).mockReturnValue([overlappingEvent]);

    await act(async () => {
      await result.current.checkAndHandleOverlap(eventData, events, mockOnSave, mockOnReset);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);

    // 다이얼로그 닫기
    act(() => {
      result.current.closeOverlapDialog();
    });

    expect(result.current.isOverlapDialogOpen).toBe(false);
  });

  it('onSave가 Promise를 반환해야 한다', async () => {
    const { result } = renderHook(() => useEventOverlap());
    const eventData = createEvent({ date: '2025-01-01', startTime: '09:00', endTime: '10:00' });
    const events: ReturnType<typeof createEvent>[] = [];

    // 중복 없음 모킹
    vi.mocked(findOverlappingEvents).mockReturnValue([]);

    await act(async () => {
      const hasOverlap = await result.current.checkAndHandleOverlap(
        eventData,
        events,
        mockOnSave,
        mockOnReset
      );
      expect(hasOverlap).toBe(false);
    });

    expect(mockOnSave).toHaveBeenCalledWith(eventData);
  });
});
