import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerUpdating,
  setupMockHandlerDeletion,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

// notistack의 enqueueSnackbar를 mocking
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

// 테스트용 이벤트 데이터
const mockEvent: Event = {
  id: '1',
  title: '테스트 이벤트',
  description: '테스트 설명',
  date: '2024-01-01',
  startTime: '10:00',
  endTime: '11:00',
  location: '테스트 장소',
  category: 'work',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

const mockEventForm: EventForm = {
  title: '새 이벤트',
  description: '새 설명',
  date: '2024-01-01',
  startTime: '12:00',
  endTime: '13:00',
  location: '새 장소',
  category: 'personal',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 15,
};

describe('useEventOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueSnackbarFn.mockClear();
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [mockEvent] });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    expect(result.current.events).toEqual([]);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.events).toEqual([mockEvent]);

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    const onSave = vi.fn();

    setupMockHandlerCreation();

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [mockEvent, { ...mockEventForm, id: '2' }] });
      })
    );

    const { result } = renderHook(() => useEventOperations(false, onSave));

    await act(async () => {
      await result.current.saveEvent(mockEventForm);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
      variant: 'success',
    });

    expect(result.current.events).toHaveLength(2);
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    const onSave = vi.fn();
    const updatedEvent = { ...mockEvent, title: '수정된 제목', endTime: '12:00' };

    setupMockHandlerUpdating();

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [updatedEvent] });
      })
    );

    const { result } = renderHook(() => useEventOperations(true, onSave));

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
      variant: 'success',
    });

    expect(result.current.events).toEqual([updatedEvent]);
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    setupMockHandlerDeletion();

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [] });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.deleteEvent(mockEvent.id);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', { variant: 'info' });

    expect(result.current.events).toEqual([]);
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });

    expect(result.current.events).toEqual([]);
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    const onSave = vi.fn();

    server.use(
      http.put('/api/events/999', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    const { result } = renderHook(() => useEventOperations(true, onSave));

    await act(async () => {
      await result.current.saveEvent({ ...mockEvent, id: '999' });
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(
      http.delete('/api/events/1', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.deleteEvent(mockEvent.id);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });

    expect(result.current.events).toEqual([mockEvent]);
  });

  it("이벤트 저장 실패 시 '일정 저장 실패'라는 토스트가 노출되어야 한다", async () => {
    const onSave = vi.fn();

    server.use(
      http.post('/api/events', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false, onSave));

    await act(async () => {
      await result.current.saveEvent(mockEventForm);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
  });

  it('fetchEvents 함수를 직접 호출할 수 있다', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [mockEvent] });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(result.current.events).toEqual([mockEvent]);
  });
});
