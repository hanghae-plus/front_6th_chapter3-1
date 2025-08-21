import { act, renderHook } from '@testing-library/react';

import { useOverlapGuard } from '../../hooks/useOverlapGuard';
import type { Event } from '../../types';

describe('useOverlapGuard', () => {
  const base: Omit<Event, 'id'> = {
    title: '회의',
    date: '2025-09-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  };

  it('겹치면 isOpen=true로 설정되고 overlappingEvents를 채운다', () => {
    const existing: Event[] = [{ id: 'e1', ...base }];
    const { result } = renderHook(() => useOverlapGuard(existing));

    let blocked: boolean | undefined;
    act(() => {
      blocked = result.current.checkAndOpen({ ...base, startTime: '10:30', endTime: '11:30' });
    });

    expect(blocked).toBe(true);
    expect(result.current.isOpen).toBe(true);
    expect(result.current.overlappingEvents).toHaveLength(1);

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('겹치지 않으면 false를 반환하고 다이얼로그는 닫힌 상태를 유지한다', () => {
    const existing: Event[] = [{ id: 'e1', ...base }];
    const { result } = renderHook(() => useOverlapGuard(existing));

    let blocked: boolean | undefined;
    act(() => {
      blocked = result.current.checkAndOpen({ ...base, startTime: '12:00', endTime: '13:00' });
    });

    expect(blocked).toBe(false);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.overlappingEvents).toHaveLength(0);
  });
});
