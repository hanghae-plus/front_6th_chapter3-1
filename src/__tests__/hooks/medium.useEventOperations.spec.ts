import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import Events from '../../__mocks__/response/events.json';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

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

describe('useEventOperations', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: Events.events });
      })
    );
    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toHaveLength(1);
      expect(result.current.events[0].title).toBe('기존 회의');
    });
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    setupMockHandlerCreation();

    const { result } = renderHook(() => useEventOperations(false));

    const newEvent = {
      title: '새 이벤트',
      date: '2025-10-01',
      startTime: '12:00',
      endTime: '13:00',
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(newEvent as Event);
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].title).toBe('새 이벤트');
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
      variant: 'success',
    });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    const updatedEvent = { ...Events.events[0], title: '수정된 팀 회의', endTime: '11:30' };

    setupMockHandlerUpdating();

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.saveEvent(updatedEvent as Event);
    });

    expect(result.current.events[0].title).toBe('수정된 팀 회의');
    expect(result.current.events[0].endTime).toBe('11:30');
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
      variant: 'success',
    });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    const eventIdToDelete = Events.events[0].id;

    setupMockHandlerDeletion();

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.deleteEvent(eventIdToDelete);
    });

    expect(result.current.events).toHaveLength(0);
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', { variant: 'info' });
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    const nonExistentEvent = { id: '999', title: '없는 이벤트' };

    server.use(http.put('/api/events/999', () => new HttpResponse(null, { status: 404 })));

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.saveEvent(nonExistentEvent as Event);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(http.delete('/api/events/1', () => new HttpResponse(null, { status: 500 })));

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.deleteEvent('1');
    });
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
  });
});
