import { renderHook, act } from '@testing-library/react';

import { useOverlapDialog } from '../../hooks/useOverlapDialog';
import { createMockEvent } from '../utils';

describe('useOverlapDialog: 중복 이벤트 다이얼로그', () => {
  const events = [createMockEvent(1), createMockEvent(2)];

  it('처음에는 다이얼로그가 닫혀있어야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    // 초기 상태 확인
    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('openOverlapDialog로 다이얼로그를 열 수 있어야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    act(() => {
      result.current.openOverlapDialog(events);
    });

    // 다이얼로그가 열렸는지 확인
    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual(events);
  });

  it('closeOverlapDialog로 다이얼로그를 닫을 수 있어야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    // 다이얼로그 열기
    act(() => {
      result.current.openOverlapDialog(events);
    });

    // 다이얼로그 닫기
    act(() => {
      result.current.closeOverlapDialog();
    });

    // 다이얼로그가 닫혔는지 확인
    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });
});
