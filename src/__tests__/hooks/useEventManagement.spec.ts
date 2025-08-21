import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { useEventManagement } from '../../hooks/useEventManagement';
import { createMockEvent } from '../utils';

describe('useEventManagement 훅', () => {
  const mockOnEditComplete = vi.fn();
  const mockSaveEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('초기 상태가 올바르게 설정된다', () => {
    const { result } = renderHook(() =>
      useEventManagement({
        isEditing: false,
        onEditComplete: mockOnEditComplete,
      })
    );

    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('충돌이 없는 이벤트 저장 시 onEditComplete가 호출된다', async () => {
    const { result } = renderHook(() =>
      useEventManagement({
        isEditing: false,
        onEditComplete: mockOnEditComplete,
      })
    );

    const eventData = createMockEvent(1);
    const events = [];

    await act(async () => {
      await result.current.handleSaveEvent(eventData, events, mockSaveEvent);
    });

    expect(mockSaveEvent).toHaveBeenCalledWith(eventData);
    expect(mockOnEditComplete).toHaveBeenCalled();
    expect(result.current.isOverlapDialogOpen).toBe(false);
  });

  it('충돌이 있는 이벤트 저장 시 다이얼로그가 열린다', async () => {
    const { result } = renderHook(() =>
      useEventManagement({
        isEditing: false,
        onEditComplete: mockOnEditComplete,
      })
    );

    const existingEvent = createMockEvent(1, {
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
    });

    const newEvent = createMockEvent(2, {
      date: '2025-10-01',
      startTime: '09:30',
      endTime: '10:30',
    });

    const events = [existingEvent];

    await act(async () => {
      await result.current.handleSaveEvent(newEvent, events, mockSaveEvent);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual([existingEvent]);
    expect(mockSaveEvent).not.toHaveBeenCalled();
    expect(mockOnEditComplete).not.toHaveBeenCalled();
  });

  it('충돌 확인 시 이벤트가 저장되고 다이얼로그가 닫힌다', async () => {
    const { result } = renderHook(() =>
      useEventManagement({
        isEditing: false,
        onEditComplete: mockOnEditComplete,
      })
    );

    // 먼저 충돌 상황을 만듦
    const existingEvent = createMockEvent(1);
    const newEvent = createMockEvent(2);
    const events = [existingEvent];

    await act(async () => {
      await result.current.handleSaveEvent(newEvent, events, mockSaveEvent);
    });

    // 충돌 확인
    await act(async () => {
      await result.current.handleOverlapConfirm(mockSaveEvent);
    });

    expect(mockSaveEvent).toHaveBeenCalledWith(newEvent);
    expect(mockOnEditComplete).toHaveBeenCalled();
    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('충돌 취소 시 다이얼로그가 닫히고 이벤트가 저장되지 않는다', async () => {
    const { result } = renderHook(() =>
      useEventManagement({
        isEditing: false,
        onEditComplete: mockOnEditComplete,
      })
    );

    // 먼저 충돌 상황을 만듦
    const existingEvent = createMockEvent(1);
    const newEvent = createMockEvent(2);
    const events = [existingEvent];

    await act(async () => {
      await result.current.handleSaveEvent(newEvent, events, mockSaveEvent);
    });

    // 충돌 취소
    act(() => {
      result.current.handleOverlapCancel();
    });

    expect(mockSaveEvent).not.toHaveBeenCalled();
    expect(mockOnEditComplete).not.toHaveBeenCalled();
    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('편집 모드에서도 동일하게 작동한다', async () => {
    const { result } = renderHook(() =>
      useEventManagement({
        isEditing: true,
        onEditComplete: mockOnEditComplete,
      })
    );

    const eventData = createMockEvent(1);
    const events = [];

    await act(async () => {
      await result.current.handleSaveEvent(eventData, events, mockSaveEvent);
    });

    expect(mockSaveEvent).toHaveBeenCalledWith(eventData);
    expect(mockOnEditComplete).toHaveBeenCalled();
  });

  it('여러 충돌 이벤트가 올바르게 감지된다', async () => {
    const { result } = renderHook(() =>
      useEventManagement({
        isEditing: false,
        onEditComplete: mockOnEditComplete,
      })
    );

    const existingEvent1 = createMockEvent(1, {
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
    });

    const existingEvent2 = createMockEvent(2, {
      date: '2025-10-01',
      startTime: '09:30',
      endTime: '10:30',
    });

    const newEvent = createMockEvent(3, {
      date: '2025-10-01',
      startTime: '09:15',
      endTime: '10:15',
    });

    const events = [existingEvent1, existingEvent2];

    await act(async () => {
      await result.current.handleSaveEvent(newEvent, events, mockSaveEvent);
    });

    expect(result.current.overlappingEvents).toHaveLength(2);
    expect(result.current.overlappingEvents).toContain(existingEvent1);
    expect(result.current.overlappingEvents).toContain(existingEvent2);
  });
});
