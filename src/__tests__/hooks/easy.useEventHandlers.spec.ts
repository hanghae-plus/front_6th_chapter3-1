import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

import { useEventHandlers } from '../../hooks/useEventHandlers.ts';
import { Event } from '../../types.ts';

vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: vi.fn(),
  }),
}));

describe('useEventHandlers', () => {
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
  ];

  const defaultParams = {
    title: '새 일정',
    date: '2025-10-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '설명',
    location: '위치',
    category: '업무',
    isRepeating: false,
    repeatType: 'none' as const,
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 60,
    startTimeError: null,
    endTimeError: null,
    editingEvent: null,
    events: mockEvents,
    saveEvent: vi.fn(),
    resetForm: vi.fn(),
    openOverlapDialog: vi.fn(),
    closeOverlapDialog: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addOrUpdateEvent 함수가 제공되어야 한다', () => {
    const { result } = renderHook(() => useEventHandlers(defaultParams));
    expect(result.current.addOrUpdateEvent).toBeDefined();
    expect(typeof result.current.addOrUpdateEvent).toBe('function');
  });

  it('handleOverlapDialogContinue 함수가 제공되어야 한다', () => {
    const { result } = renderHook(() => useEventHandlers(defaultParams));
    expect(result.current.handleOverlapDialogContinue).toBeDefined();
    expect(typeof result.current.handleOverlapDialogContinue).toBe('function');
  });

  it('필수 정보가 없을 때 addOrUpdateEvent 호출 시 snackbar 에러 표시 후 리턴해야 한다', async () => {
    const paramsWithEmptyTitle = { ...defaultParams, title: '' };
    const { result } = renderHook(() => useEventHandlers(paramsWithEmptyTitle));

    await act(async () => {
      await result.current.addOrUpdateEvent();
    });

    expect(defaultParams.saveEvent).not.toHaveBeenCalled();
    expect(defaultParams.openOverlapDialog).not.toHaveBeenCalled();
  });

  it('시간 에러가 있을 때 addOrUpdateEvent 호출 시 snackbar 에러 표시 후 리턴해야 한다', async () => {
    const paramsWithTimeError = { ...defaultParams, startTimeError: '시간 오류' };
    const { result } = renderHook(() => useEventHandlers(paramsWithTimeError));

    await act(async () => {
      await result.current.addOrUpdateEvent();
    });

    expect(defaultParams.saveEvent).not.toHaveBeenCalled();
    expect(defaultParams.openOverlapDialog).not.toHaveBeenCalled();
  });

  it('겹치는 일정이 없을 때 addOrUpdateEvent 호출 시 바로 저장해야 한다', async () => {
    const paramsWithNoOverlap = { ...defaultParams, startTime: '14:00', endTime: '15:00' };
    const { result } = renderHook(() => useEventHandlers(paramsWithNoOverlap));

    await act(async () => {
      await result.current.addOrUpdateEvent();
    });

    expect(paramsWithNoOverlap.saveEvent).toHaveBeenCalledTimes(1);
    expect(paramsWithNoOverlap.resetForm).toHaveBeenCalledTimes(1);
    expect(paramsWithNoOverlap.openOverlapDialog).not.toHaveBeenCalled();
  });

  it('겹치는 일정이 있을 때 addOrUpdateEvent 호출 시 겹침 다이얼로그를 열어야 한다', async () => {
    // 기존 일정과 겹치는 시간 설정 (10:00-11:00과 10:30-11:30이 겹침)
    const paramsWithOverlap = { ...defaultParams, startTime: '10:30', endTime: '11:30' };
    const { result } = renderHook(() => useEventHandlers(paramsWithOverlap));

    await act(async () => {
      await result.current.addOrUpdateEvent();
    });

    expect(paramsWithOverlap.openOverlapDialog).toHaveBeenCalledTimes(1);
    expect(paramsWithOverlap.saveEvent).not.toHaveBeenCalled();
    expect(paramsWithOverlap.resetForm).not.toHaveBeenCalled();
  });

  it('handleOverlapDialogContinue 호출 시 다이얼로그를 닫고 일정을 저장해야 한다', async () => {
    const { result } = renderHook(() => useEventHandlers(defaultParams));

    await act(async () => {
      await result.current.handleOverlapDialogContinue();
    });

    expect(defaultParams.closeOverlapDialog).toHaveBeenCalledTimes(1);
    expect(defaultParams.saveEvent).toHaveBeenCalledTimes(1);
    expect(defaultParams.resetForm).toHaveBeenCalledTimes(1);
  });

  it('수정 모드일 때 올바른 이벤트 데이터를 생성해야 한다', async () => {
    const editingEvent: Event = {
      id: 'edit-1',
      date: '2025-10-01',
      title: '수정할 일정',
      description: '수정할 설명',
      location: '수정할 위치',
      category: '업무',
      startTime: '16:00',
      endTime: '17:00',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    };

    const paramsWithEdit = {
      ...defaultParams,
      editingEvent,
      startTime: '16:00',
      endTime: '17:00',
    };

    const { result } = renderHook(() => useEventHandlers(paramsWithEdit));

    await act(async () => {
      await result.current.addOrUpdateEvent();
    });

    const expectedEventData = expect.objectContaining({
      id: 'edit-1',
      title: '새 일정',
      date: '2025-10-01',
      startTime: '16:00',
      endTime: '17:00',
    });

    expect(paramsWithEdit.saveEvent).toHaveBeenCalledWith(expectedEventData);
  });
});
