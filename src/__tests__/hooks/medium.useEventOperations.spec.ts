import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { events } from '../../__mocks__/response/events.json' with { type: 'json' };
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

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

beforeEach(() => {
  enqueueSnackbarFn.mockClear();
});

describe('초기 데이터 로딩', () => {
  it('훅 초기화 시 서버에서 이벤트 목록을 불러와 state에 저장한다', async () => {
    // Given: 서버에 이벤트 데이터가 존재하는 상황
    const isEditing = false;

    // When: useEventOperations 훅을 초기화할 때
    const { result } = renderHook(() => useEventOperations(isEditing));

    // Then: 서버의 이벤트 데이터가 올바르게 로드되어야 함
    await waitFor(() => {
      expect(result.current.events).toEqual(events);
    });
  });
});

describe('새 이벤트 생성', () => {
  it('새 이벤트 정보를 전달하면 서버에 저장하고 목록을 업데이트한다', async () => {
    // Given: 새 이벤트 생성 모드와 저장 콜백
    const isEditing = false;
    const onSaveCallback = vi.fn();
    const { result } = renderHook(() => useEventOperations(isEditing, onSaveCallback));

    const newEventData = {
      title: '새로운 미팅',
      date: '2025-08-18',
      startTime: '10:00',
      endTime: '12:00',
      description: '중요한 회의',
      location: '본사 3층 회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    } as EventForm;

    // When: 새 이벤트를 저장할 때
    await act(async () => {
      await result.current.saveEvent(newEventData);
    });

    // Then: 성공 알림이 표시되고 콜백이 호출되며 이벤트 목록에 추가되어야 함
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
      variant: 'success',
    });
    expect(onSaveCallback).toHaveBeenCalledOnce();

    const createdEvent = result.current.events.find((event) => event.title === newEventData.title);
    expect(createdEvent).toEqual(
      expect.objectContaining({
        title: '새로운 미팅',
        date: '2025-08-18',
        startTime: '10:00',
        endTime: '12:00',
        description: '중요한 회의',
        location: '본사 3층 회의실',
        category: '업무',
      })
    );
  });
});

describe('기존 이벤트 수정', () => {
  it('기존 이벤트 ID와 함께 수정된 정보를 전달하면 서버에서 업데이트한다', async () => {
    // Given: 이벤트 수정 모드와 기존 이벤트 ID
    const isEditing = true;
    const onSaveCallback = vi.fn();
    const { result } = renderHook(() => useEventOperations(isEditing, onSaveCallback));

    const updatedEventData = {
      id: '1',
      title: '수정된 팀 회의',
      date: '2025-08-18',
      startTime: '10:00',
      endTime: '12:00',
      description: '수정된 회의 내용',
      location: '새로운 회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    } as Event;

    // When: 기존 이벤트를 수정할 때
    await act(async () => {
      await result.current.saveEvent(updatedEventData);
    });

    // Then: 수정 성공 알림이 표시되고 콜백이 호출되어야 함
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
      variant: 'success',
    });
    expect(onSaveCallback).toHaveBeenCalledOnce();
  });
});

describe('이벤트 삭제', () => {
  it('기존 이벤트 ID를 전달하면 서버에서 삭제하고 목록을 업데이트한다', async () => {
    // Given: 삭제할 이벤트가 존재하는 상황
    const { result } = renderHook(() => useEventOperations(false));

    // 초기 데이터 로딩 대기
    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(0);
    });

    const initialEventCount = result.current.events.length;
    const targetEventId = '1';

    // When: 이벤트를 삭제할 때
    await act(async () => {
      await result.current.deleteEvent(targetEventId);
    });

    // Then: 삭제 성공 알림이 표시되고 이벤트 목록에서 제거되어야 함
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', {
      variant: 'info',
    });

    await waitFor(() => {
      expect(result.current.events.length).toBe(initialEventCount - 1);
      expect(result.current.events.find((event) => event.id === targetEventId)).toBeUndefined();
    });
  });
});

describe('에러 처리', () => {
  it('이벤트 로딩 실패 시 에러 토스트를 표시한다', async () => {
    // Given: 서버에서 이벤트 로딩이 실패하는 상황
    server.use(
      http.get('/api/events', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    // When: 훅을 초기화할 때
    renderHook(() => useEventOperations(false));

    // Then: 에러 토스트가 표시되어야 함
    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', {
        variant: 'error',
      });
    });
  });

  it('이벤트 저장 실패 시 에러 토스트를 표시한다', async () => {
    // Given: 서버에서 이벤트 저장이 실패하는 상황
    server.use(
      http.post('/api/events', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));
    const newEvent = {
      title: '테스트 이벤트',
      date: '2025-08-18',
      startTime: '10:00',
      endTime: '12:00',
      description: '테스트',
      location: '테스트',
      category: '테스트',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    } as EventForm;

    // When: 이벤트 저장을 시도할 때
    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    // Then: 에러 토스트가 표시되어야 함
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', {
      variant: 'error',
    });
  });

  it('이벤트 삭제 실패 시 에러 토스트를 표시한다', async () => {
    // Given: 서버에서 이벤트 삭제가 실패하는 상황
    server.use(
      http.delete('/api/events/1', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    // When: 이벤트 삭제를 시도할 때
    await act(async () => {
      await result.current.deleteEvent('1');
    });

    // Then: 에러 토스트가 표시되어야 함
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', {
      variant: 'error',
    });
  });
});
