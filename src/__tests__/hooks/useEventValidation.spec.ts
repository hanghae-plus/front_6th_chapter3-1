import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

import { useEventValidation } from '../../hooks/useEventValidation';
import type { Event, EventForm } from '../../types';

const enqueueSnackbarFn = vi.fn();
vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

const mockEvents: Event[] = [
  {
    id: '1',
    title: '기존 일정',
    date: '2025-01-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '테스트 위치',
    category: '업무',
    notificationTime: 10,
    repeat: { type: 'none', interval: 1 },
  },
];

const mockSaveEvent = vi.fn();

const setup = () => {
  return renderHook(() => useEventValidation({ events: mockEvents, onSaveEvent: mockSaveEvent }));
};

describe('useEventValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('필수 필드가 누락되면 에러 메시지를 표시하고 저장하지 않는다.', async () => {
    const { result } = setup();

    const eventData: EventForm = {
      title: '',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.validateAndSaveEvent(eventData, {
        startTimeError: '',
        endTimeError: '',
      });
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('필수 정보를 모두 입력해주세요.', {
      variant: 'error',
    });
    expect(mockSaveEvent).not.toHaveBeenCalled();
  });

  it('시간 에러가 있으면 에러 메시지를 표시하고 저장하지 않는다.', async () => {
    const { result } = setup();

    const eventData: EventForm = {
      title: '테스트 일정',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '09:00',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.validateAndSaveEvent(eventData, {
        startTimeError: '...',
        endTimeError: '...',
      });
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('시간 설정을 확인해주세요.', {
      variant: 'error',
    });
    expect(mockSaveEvent).not.toHaveBeenCalled();
  });

  it('겹치는 이벤트가 없으면 바로 저장한다.', async () => {
    const { result } = setup();

    const eventData: EventForm = {
      title: '새로운 일정',
      date: '2025-01-16',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.validateAndSaveEvent(eventData, {
        startTimeError: '',
        endTimeError: '',
      });
    });

    expect(mockSaveEvent).toHaveBeenCalledWith(eventData);
  });

  it('겹치는 이벤트가 있으면 다이얼로그를 열고 pendingEventData를 설정한다.', async () => {
    const { result } = setup();

    const eventData: EventForm = {
      title: '겹치는 일정',
      date: '2025-01-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.validateAndSaveEvent(eventData, {
        startTimeError: '',
        endTimeError: '',
      });
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toHaveLength(1);
    expect(mockSaveEvent).not.toHaveBeenCalled();
  });

  it('handleConfirmOverlap을 호출하면 pendingEventData를 저장하고 다이얼로그를 닫는다.', async () => {
    const { result } = setup();

    const eventData: EventForm = {
      title: '겹치는 일정',
      date: '2025-01-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '테스트 설명',
      location: '테스트 위치',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.validateAndSaveEvent(eventData, {
        startTimeError: '',
        endTimeError: '',
      });
    });

    await act(async () => {
      await result.current.handleConfirmOverlap();
    });

    expect(mockSaveEvent).toHaveBeenCalledWith(eventData);
    expect(result.current.isOverlapDialogOpen).toBe(false);
  });
});
