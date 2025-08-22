import { renderHook, act } from '@testing-library/react';
import { useSnackbar } from 'notistack';
import { vi } from 'vitest';

import { useCalendarView } from '../../hooks/useCalendarView';
import { useEventForm } from '../../hooks/useEventForm';
import { useEventManager } from '../../hooks/useEventManager';
import { useEventOperations } from '../../hooks/useEventOperations';
import { useNotifications } from '../../hooks/useNotifications';
import { useSearch } from '../../hooks/useSearch';
import * as eventOverlap from '../../utils/eventOverlap';

// 모든 의존성 훅들을 모킹합니다.
vi.mock('../../hooks/useEventForm');
vi.mock('../../hooks/useEventOperations');
vi.mock('../../hooks/useNotifications');
vi.mock('../../hooks/useCalendarView');
vi.mock('../../hooks/useSearch');
vi.mock('notistack');
vi.mock('../../utils/eventOverlap');

describe('useEventManager', () => {
  it('새 이벤트 추가 시 saveEvent가 호출되어야 한다', async () => {
    const mockSaveEvent = vi.fn();
    const mockEnqueueSnackbar = vi.fn();

    // 각 훅들이 반환할 모의 데이터를 설정합니다.
    (useEventForm as ReturnType<typeof vi.fn>).mockReturnValue({
      title: 'Test Event',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      resetForm: vi.fn(),
    });
    (useEventOperations as ReturnType<typeof vi.fn>).mockReturnValue({
      events: [],
      saveEvent: mockSaveEvent,
      deleteEvent: vi.fn(),
    });
    (useNotifications as ReturnType<typeof vi.fn>).mockReturnValue({
      notifications: [],
      notifiedEvents: [],
      setNotifications: vi.fn(),
    });
    (useCalendarView as ReturnType<typeof vi.fn>).mockReturnValue({
      view: 'month',
      currentDate: new Date(),
    });
    (useSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      filteredEvents: [],
    });
    (useSnackbar as ReturnType<typeof vi.fn>).mockReturnValue({
      enqueueSnackbar: mockEnqueueSnackbar,
    });
    // 겹치는 이벤트가 없다고 가정합니다.
    vi.spyOn(eventOverlap, 'findOverlappingEvents').mockReturnValue([]);

    const { result } = renderHook(() => useEventManager());

    // addOrUpdateEvent 함수를 실행합니다.
    await act(async () => {
      await result.current.addOrUpdateEvent();
    });

    // saveEvent가 올바른 데이터와 함께 호출되었는지 확인합니다.
    expect(mockSaveEvent).toHaveBeenCalled();
    // 필수 정보가 모두 있으므로 에러 스낵바는 호출되지 않아야 합니다.
    expect(mockEnqueueSnackbar).not.toHaveBeenCalled();
  });
});
