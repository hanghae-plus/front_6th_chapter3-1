import { act, renderHook } from '@testing-library/react';

import { useOverlapDialog } from '../../hooks/useOverlapDialog.ts';
import { Event } from '../../types.ts';

describe('useOverlapDialog', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      date: '2025-10-01',
      title: '기존 회의',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      startTime: '10:00',
      endTime: '11:00',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60,
    },
    {
      id: '2',
      date: '2025-10-01',
      title: '또 다른 회의',
      description: '프로젝트 회의',
      location: '회의실 B',
      category: '업무',
      startTime: '14:00',
      endTime: '15:00',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 60,
    },
  ];

  it('초기 상태에서 다이얼로그가 닫혀있어야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());
    expect(result.current.isOverlapDialogOpen).toBe(false);
  });

  it('초기 상태에서 overlappingEvents가 빈 배열이어야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('openOverlapDialog 호출 시 다이얼로그가 열려야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());
    act(() => {
      result.current.openOverlapDialog(mockEvents);
    });
    expect(result.current.isOverlapDialogOpen).toBe(true);
  });

  it('openOverlapDialog 호출 시 overlappingEvents가 설정되어야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());
    act(() => {
      result.current.openOverlapDialog(mockEvents);
    });
    expect(result.current.overlappingEvents).toEqual(mockEvents);
  });

  it('closeOverlapDialog 호출 시 다이얼로그가 닫혀야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());
    act(() => {
      result.current.openOverlapDialog(mockEvents);
    });
    act(() => {
      result.current.closeOverlapDialog();
    });
    expect(result.current.isOverlapDialogOpen).toBe(false);
  });

  it('빈 배열로 openOverlapDialog 호출 시에도 정상 동작해야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());
    act(() => {
      result.current.openOverlapDialog([]);
    });
    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual([]);
  });

  it('다이얼로그가 열린 상태에서 다른 이벤트로 재호출 시 이벤트가 업데이트되어야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());
    const firstEvents = [mockEvents[0]];
    const secondEvents = [mockEvents[1]];

    act(() => {
      result.current.openOverlapDialog(firstEvents);
    });
    expect(result.current.overlappingEvents).toEqual(firstEvents);

    act(() => {
      result.current.openOverlapDialog(secondEvents);
    });
    expect(result.current.overlappingEvents).toEqual(secondEvents);
    expect(result.current.isOverlapDialogOpen).toBe(true);
  });
});
